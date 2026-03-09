'use strict';

const { Op }       = require('sequelize');
const { Transaction, Consumer, PaymentHistory, User } = require('../models');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

module.exports = {
  // ── Transactions ──────────────────────────────────────────────

  listTransactions: async ({ type, category, date_from, date_to, search, page, limit } = {}) => {
    const where = {};
    if (type)     where.type     = type;
    if (category) where.category = category;
    if (search)   where.description = { [Op.like]: `%${search}%` };
    if (date_from || date_to) {
      where.transaction_date = {};
      if (date_from) where.transaction_date[Op.gte] = date_from;
      if (date_to)   where.transaction_date[Op.lte] = date_to;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getTransactionById: async (id) => {
    const t = await Transaction.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    });
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    return t;
  },

  createTransaction: async (payload, userId) => {
    return Transaction.create({ ...payload, created_by: userId });
  },

  updateTransaction: async (id, payload) => {
    const t = await Transaction.findByPk(id);
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    await t.update(payload);
    return t;
  },

  removeTransaction: async (id) => {
    const t = await Transaction.findByPk(id);
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    await t.destroy();
  },

  getSummary: async () => {
    const [pemasukan, pengeluaran] = await Promise.all([
      Transaction.sum('amount', { where: { type: 'Pemasukan' } }),
      Transaction.sum('amount', { where: { type: 'Pengeluaran' } }),
    ]);
    const kas_masuk  = pemasukan  || 0;
    const kas_keluar = pengeluaran || 0;
    return { kas_masuk, kas_keluar, saldo: kas_masuk - kas_keluar };
  },

  // ── Consumers ─────────────────────────────────────────────────

  listConsumers: async ({ search, blok, page, limit } = {}) => {
    const where = {};
    if (search) where[Op.or] = [
      { name:      { [Op.like]: `%${search}%` } },
      { unit_code: { [Op.like]: `%${search}%` } },
    ];
    if (blok) where.unit_code = { [Op.like]: `${blok}%` };

    const { count, rows } = await Consumer.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getConsumerById: async (id) => {
    const c = await Consumer.findByPk(id, {
      include: [{ model: PaymentHistory, as: 'payments', order: [['payment_date', 'DESC']] }],
    });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    return c;
  },

  createConsumer: async (payload) => Consumer.create(payload),

  updateConsumer: async (id, payload) => {
    const c = await Consumer.findByPk(id);
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    await c.update(payload);
    return c;
  },

  removeConsumer: async (id) => {
    const c = await Consumer.findByPk(id);
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    await PaymentHistory.destroy({ where: { consumer_id: id } });
    await c.destroy();
  },

  // ── Payment Histories ─────────────────────────────────────────

  listPayments: async (consumerId) => {
    const c = await Consumer.findByPk(consumerId);
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    return PaymentHistory.findAll({
      where: { consumer_id: consumerId },
      order: [['payment_date', 'DESC']],
    });
  },

  createPayment: async (consumerId, payload) => {
    const c = await Consumer.findByPk(consumerId);
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    const payment = await PaymentHistory.create({ ...payload, consumer_id: consumerId });
    // Update paid_amount
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await c.update({ paid_amount: total || 0 });
    return payment;
  },

  updatePayment: async (consumerId, paymentId, payload) => {
    const p = await PaymentHistory.findOne({ where: { id: paymentId, consumer_id: consumerId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.update(payload);
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await Consumer.update({ paid_amount: total || 0 }, { where: { id: consumerId } });
    return p;
  },

  removePayment: async (consumerId, paymentId) => {
    const p = await PaymentHistory.findOne({ where: { id: paymentId, consumer_id: consumerId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.destroy();
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await Consumer.update({ paid_amount: total || 0 }, { where: { id: consumerId } });
  },
};
