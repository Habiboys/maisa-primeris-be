'use strict';

const { Op }   = require('sequelize');
const { HousingUnit, HousingPaymentHistory, Consumer } = require('../models');

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

  list: async ({ status, tipe, search, page, limit } = {}) => {
    const where = {};
    if (status) where.status    = status;
    if (tipe)   where.unit_type = tipe;
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

  getById: async (id) => {
    const u = await HousingUnit.findByPk(id, {
      include: [
        { model: Consumer, as: 'consumer', attributes: ['id', 'name', 'phone', 'email'] },
        { model: HousingPaymentHistory, as: 'payments', order: [['payment_date', 'DESC']] },
      ],
    });
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return u;
  },

  create: async (payload) => HousingUnit.create(payload),

  update: async (id, payload) => {
    const u = await HousingUnit.findByPk(id);
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    await u.update(payload);
    return u;
  },

  remove: async (id) => {
    const u = await HousingUnit.findByPk(id);
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    await u.destroy();
  },

  // ── Payment Histories ──────────────────────────────────────────

  listPayments: async (housingId) => {
    const u = await HousingUnit.findByPk(housingId);
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return HousingPaymentHistory.findAll({
      where: { housing_unit_id: housingId },
      order: [['payment_date', 'DESC']],
    });
  },

  createPayment: async (housingId, payload) => {
    const u = await HousingUnit.findByPk(housingId);
    if (!u) throw { message: 'Unit perumahan tidak ditemukan', status: 404 };
    return HousingPaymentHistory.create({ ...payload, housing_unit_id: housingId });
  },

  updatePayment: async (housingId, paymentId, payload) => {
    const p = await HousingPaymentHistory.findOne({ where: { id: paymentId, housing_unit_id: housingId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.update(payload);
    return p;
  },

  removePayment: async (housingId, paymentId) => {
    const p = await HousingPaymentHistory.findOne({ where: { id: paymentId, housing_unit_id: housingId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.destroy();
  },
};
