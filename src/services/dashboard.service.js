'use strict';

const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const sequelize = require('../models').sequelize;
const {
  Transaction, HousingUnit, Consumer, Lead, Attendance, MarketingPerson, Project,
} = require('../models');
const { withTenantWhere } = require('../utils/tenant');

module.exports = {
  // ── KPI Summary ───────────────────────────────────────────────
  getSummary: async (actor) => {
    const tenantWhere = withTenantWhere({}, actor);
    const [totalUnit, unitTerjual, unitProgres] = await Promise.all([
      HousingUnit.count({ where: tenantWhere }),
      HousingUnit.count({ where: { ...tenantWhere, status: 'Sold' } }),
      HousingUnit.count({ where: { ...tenantWhere, status: 'Proses' } }),
    ]);
    const pendapatan = await Transaction.sum('amount', { where: { ...tenantWhere, type: 'Pemasukan' } }) || 0;
    const unit_kritis = Math.max(0, totalUnit - unitTerjual - unitProgres);

    return {
      total_unit            : totalUnit,
      unit_terjual          : unitTerjual,
      unit_progres          : unitProgres,
      pendapatan,
      target_penjualan_pct  : totalUnit > 0 ? Math.round((unitTerjual / totalUnit) * 100) : 0,
      unit_kritis,
    };
  },

  // ── Cashflow (6 atau N bulan terakhir) ────────────────────────
  getCashflow: async (months = 6, actor) => {
    const tenantWhere = withTenantWhere({}, actor);
    const n = Math.min(parseInt(months, 10) || 6, 24);
    const results = [];
    const now = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const to   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

      const [masuk, keluar] = await Promise.all([
        Transaction.sum('amount', { where: { ...tenantWhere, type: 'Pemasukan',    transaction_date: { [Op.between]: [from, to] } } }),
        Transaction.sum('amount', { where: { ...tenantWhere, type: 'Pengeluaran',  transaction_date: { [Op.between]: [from, to] } } }),
      ]);

      results.push({
        month  : d.toLocaleString('id-ID', { month: 'short' }),
        masuk  : masuk  || 0,
        keluar : keluar || 0,
      });
    }
    return results;
  },

  // ── Sales Distribution ────────────────────────────────────────
  getSalesDistribution: async (actor) => {
    const rows = await HousingUnit.findAll({
      where: withTenantWhere({}, actor),
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    return rows.map(r => ({ status: r.status, count: parseInt(r.count, 10) }));
  },

  // ── Construction Progress (dummy per-phase) ───────────────────
  getConstructionProgress: async (actor) => {
    const tenantWhere = withTenantWhere({}, actor);
    const total = await HousingUnit.count({ where: tenantWhere });
    if (total === 0) return [];
    // Buat estimasi progress per fase dari data yang ada
    const sold    = await HousingUnit.count({ where: { ...tenantWhere, status: 'Sold' } });
    const proses  = await HousingUnit.count({ where: { ...tenantWhere, status: 'Proses' } });
    const avail   = await HousingUnit.count({ where: { ...tenantWhere, status: 'Tersedia' } });

    return [
      { phase: 'Pondasi',         target: total,                  actual: Math.round(sold * 1.2 + proses) },
      { phase: 'Struktur',        target: Math.round(total * 0.9), actual: sold + Math.round(proses * 0.8) },
      { phase: 'Finishing',       target: Math.round(total * 0.7), actual: sold },
      { phase: 'Serah Terima',    target: Math.round(total * 0.5), actual: sold },
    ].map(r => ({ ...r, actual: Math.min(r.actual, r.target) }));
  },

  // ── Budget vs Actual ──────────────────────────────────────────
  getBudgetVsActual: async (actor) => {
    const months = 6;
    const tenantWhere = withTenantWhere({}, actor);
    const totalBudgetRaw = await Project.sum('budget_cap', { where: tenantWhere });
    const totalBudget = Number(totalBudgetRaw) || 0;
    const budgetPerMonth = months > 0 ? Math.round(totalBudget / months) : 0;

    const rows = await module.exports.getCashflow(months, actor);
    return rows.map(r => ({
      month      : r.month,
      pagu       : budgetPerMonth,
      realisasi  : r.keluar,
    }));
  },
};
