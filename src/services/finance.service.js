'use strict';

const { Op }       = require('sequelize');
const { Transaction, Consumer, PaymentHistory, User, HousingUnit } = require('../models');
const { withTenantWhere, requireCompanyId, isPlatformOwner, stripCompanyId } = require('../utils/tenant');

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

  listTransactions: async ({ type, category, date_from, date_to, search, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
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

  getTransactionById: async (id, actor) => {
    const t = await Transaction.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    });
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    return t;
  },

  createTransaction: async (payload, userId, actor) => {
    const companyId = requireCompanyId(actor);
    return Transaction.create({ ...payload, created_by: userId, company_id: companyId });
  },

  updateTransaction: async (id, payload, actor) => {
    const t = await Transaction.findOne({ where: withTenantWhere({ id }, actor) });
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    // Jangan izinkan company_id berubah lewat payload (mencegah cross-tenant data)
    await t.update(stripCompanyId(payload));
    return t;
  },

  removeTransaction: async (id, actor) => {
    const t = await Transaction.findOne({ where: withTenantWhere({ id }, actor) });
    if (!t) throw { message: 'Transaksi tidak ditemukan', status: 404 };
    await t.destroy();
  },

  getSummary: async (actor) => {
    const tenantWhere = withTenantWhere({}, actor);
    const [pemasukan, pengeluaran] = await Promise.all([
      Transaction.sum('amount', { where: { ...tenantWhere, type: 'Pemasukan' } }),
      Transaction.sum('amount', { where: { ...tenantWhere, type: 'Pengeluaran' } }),
    ]);
    const kas_masuk  = pemasukan  || 0;
    const kas_keluar = pengeluaran || 0;
    return { kas_masuk, kas_keluar, saldo: kas_masuk - kas_keluar };
  },

  exportTransactions: async ({ type, category, date_from, date_to, search } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) where.description = { [Op.like]: `%${search}%` };
    if (date_from || date_to) {
      where.transaction_date = {};
      if (date_from) where.transaction_date[Op.gte] = date_from;
      if (date_to) where.transaction_date[Op.lte] = date_to;
    }

    return Transaction.findAll({
      where,
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
    });
  },

  // ── Consumers ─────────────────────────────────────────────────

  listConsumers: async ({ search, blok, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (search) where[Op.or] = [
      { name:      { [Op.like]: `%${search}%` } },
      { unit_code: { [Op.like]: `%${search}%` } },
    ];
    if (blok) where.unit_code = { [Op.like]: `${blok}%` };

    const { count, rows } = await Consumer.findAndCountAll({
      where,
      include: [{ model: PaymentHistory, as: 'payments', attributes: ['id', 'payment_date', 'amount', 'debit', 'credit', 'payment_method', 'notes', 'estimasi_date', 'status', 'transaction_name', 'transaction_category', 'category'], order: [['payment_date', 'DESC']], separate: false }],
      order: [['name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getConsumerById: async (id, actor) => {
    const c = await Consumer.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: PaymentHistory, as: 'payments', order: [['payment_date', 'DESC']] }],
    });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    return c;
  },

  createConsumer: async (payload, actor) => {
    const { housing_unit_id, ...rest } = payload;
    const consumer = await Consumer.create({ ...rest, company_id: requireCompanyId(actor) });
    if (housing_unit_id) {
      const unit = await HousingUnit.findOne({ where: withTenantWhere({ id: housing_unit_id }, actor) });
      if (unit) await unit.update({ consumer_id: consumer.id });
    }
    return consumer;
  },

  updateConsumer: async (id, payload, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    await c.update(stripCompanyId(payload));
    return c;
  },

  removeConsumer: async (id, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    await PaymentHistory.destroy({ where: { consumer_id: id } });
    await c.destroy();
  },

  exportConsumers: async ({ search, blok } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { unit_code: { [Op.like]: `%${search}%` } },
      ];
    }
    if (blok) where.unit_code = { [Op.like]: `${blok}%` };

    return Consumer.findAll({
      where,
      order: [['name', 'ASC']],
    });
  },

  // ── Payment Histories ─────────────────────────────────────────

  listPayments: async (consumerId, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id: consumerId }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    return PaymentHistory.findAll({
      where: { consumer_id: consumerId },
      order: [['payment_date', 'DESC']],
    });
  },

  createPayment: async (consumerId, payload, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id: consumerId }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    const debit = payload.debit != null ? Number(payload.debit) : (payload.amount >= 0 ? Number(payload.amount) : 0);
    const credit = payload.credit != null ? Number(payload.credit) : (payload.amount < 0 ? -Number(payload.amount) : 0);
    const amount = debit - credit;
    const transaction_category = debit > 0 ? 'Debit' : (credit > 0 ? 'Kredit' : 'Debit');
    const createPayload = {
      consumer_id: consumerId,
      payment_date: payload.payment_date,
      payment_method: payload.payment_method,
      notes: payload.notes,
      debit,
      credit,
      amount,
      estimasi_date: payload.estimasi_date || null,
      transaction_name: payload.transaction_name || payload.notes || null,
      transaction_category,
      category: payload.category || null,
    };
    const payment = await PaymentHistory.create(createPayload);
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await c.update({ paid_amount: total || 0 });
    return payment;
  },

  updatePayment: async (consumerId, paymentId, payload, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id: consumerId }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    const p = await PaymentHistory.findOne({ where: { id: paymentId, consumer_id: consumerId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    const updateData = { ...payload };
    if (payload.debit != null || payload.credit != null) {
      const debit = payload.debit != null ? Number(payload.debit) : (p.debit ?? 0);
      const credit = payload.credit != null ? Number(payload.credit) : (p.credit ?? 0);
      updateData.amount = debit - credit;
      updateData.debit = debit;
      updateData.credit = credit;
      updateData.transaction_category = debit > 0 ? 'Debit' : (credit > 0 ? 'Kredit' : 'Debit');
    }
    await p.update(updateData);
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await Consumer.update({ paid_amount: total || 0 }, { where: { id: consumerId } });
    return p;
  },

  removePayment: async (consumerId, paymentId, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id: consumerId }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    const p = await PaymentHistory.findOne({ where: { id: paymentId, consumer_id: consumerId } });
    if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };
    await p.destroy();
    const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId } });
    await Consumer.update({ paid_amount: total || 0 }, { where: { id: consumerId } });
  },
};
