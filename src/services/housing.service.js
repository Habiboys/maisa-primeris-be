'use strict';

const { Op }   = require('sequelize');
const { HousingUnit, HousingPaymentHistory, Consumer } = require('../models');
const { withTenantWhere, requireCompanyId } = require('../utils/tenant');

// Helper untuk normalisasi numeric:
// - `undefined` => tidak diubah (biar Sequelize tidak ikut menimpa field)
// - `null` => di-*clear* (biar Sequelize benar-benar update ke NULL di DB)
// - '' => dianggap tidak diisi (undefined)
const numOrNull = (v) => {
  if (v === '' || v === undefined) return undefined;
  if (v === null) return null;
  const n = (typeof v === 'number') ? v : Number(v);
  return !Number.isNaN(n) ? n : undefined;
};

function normalizeHousingPayload(payload) {
  const p = { ...payload };
  if (p.luas_tanah !== undefined) p.luas_tanah = numOrNull(p.luas_tanah);
  if (p.luas_bangunan !== undefined) p.luas_bangunan = numOrNull(p.luas_bangunan);
  if (p.harga_jual !== undefined) p.harga_jual = numOrNull(p.harga_jual);
  if (p.harga_per_meter !== undefined) p.harga_per_meter = numOrNull(p.harga_per_meter);
  if (p.daya_listrik !== undefined) p.daya_listrik = numOrNull(p.daya_listrik);
  if (p.panjang_kanan !== undefined) p.panjang_kanan = numOrNull(p.panjang_kanan);
  if (p.panjang_kiri !== undefined) p.panjang_kiri = numOrNull(p.panjang_kiri);
  if (p.lebar_depan !== undefined) p.lebar_depan = numOrNull(p.lebar_depan);
  if (p.lebar_belakang !== undefined) p.lebar_belakang = numOrNull(p.lebar_belakang);
  return p;
}

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

module.exports = {
  // ── Units ──────────────────────────────────────────────────────

  list: async ({ status, tipe, search, project_id, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (status) where.status    = status;
    if (tipe)   where.unit_type = tipe;
    if (project_id) where.project_id = project_id;
    if (search) where[Op.or]    = [
      { unit_code: { [Op.like]: `%${search}%` } },
      { unit_type: { [Op.like]: `%${search}%` } },
    ];

    const { count, rows } = await HousingUnit.findAndCountAll({
      where,
      include: [{ model: Consumer, as: 'consumer', attributes: ['id', 'name', 'phone'] }],
      order: [['unit_code', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getById: async (id, actor) => {
    const u = await HousingUnit.findOne({
      where: withTenantWhere({ id }, actor),
      include: [
        { model: Consumer, as: 'consumer', attributes: ['id', 'name', 'phone', 'email'] },
        { model: HousingPaymentHistory, as: 'payments', order: [['payment_date', 'DESC']] },
      ],
    });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return u;
  },

  create: async (payload, actor) => HousingUnit.create({ ...normalizeHousingPayload(payload), company_id: requireCompanyId(actor) }),

  update: async (id, payload, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    await u.update(normalizeHousingPayload(payload));
    return u;
  },

  remove: async (id, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    await u.destroy();
  },

  // ── Payment Histories ──────────────────────────────────────────

  listPayments: async (housingId, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id: housingId }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return HousingPaymentHistory.findAll({
      where: { housing_unit_id: housingId },
      order: [['payment_date', 'DESC']],
    });
  },

  createPayment: async (housingId, payload, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id: housingId }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return HousingPaymentHistory.create({ ...payload, housing_unit_id: housingId });
  },

  updatePayment: async (housingId, paymentId, payload, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id: housingId }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    const p = await HousingPaymentHistory.findOne({ where: { id: paymentId, housing_unit_id: housingId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.update(payload);
    return p;
  },

  removePayment: async (housingId, paymentId, actor) => {
    const u = await HousingUnit.findOne({ where: withTenantWhere({ id: housingId }, actor) });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    const p = await HousingPaymentHistory.findOne({ where: { id: paymentId, housing_unit_id: housingId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.destroy();
  },
};
