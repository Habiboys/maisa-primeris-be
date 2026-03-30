'use strict';

const { Op }       = require('sequelize');
const { sequelize, Transaction, Consumer, PaymentHistory, User, HousingUnit, Lead, MarketingPerson } = require('../models');
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
    const lead_id = payload.lead_id;
    if (!lead_id) {
      throw { message: 'lead_id wajib. Data konsumen piutang hanya boleh dibuat dari lead Deal.', status: 400 };
    }

    const companyId = requireCompanyId(actor);
    const safe = stripCompanyId(payload);
    const nik = safe.nik ?? null;
    const address = safe.address ?? null;
    const payment_scheme = safe.payment_scheme ?? null;

    const t = await sequelize.transaction();
    try {
      const lead = await Lead.findOne({
        where: { id: lead_id, status: 'Deal', consumer_id: null },
        include: [
          { model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true },
          { model: HousingUnit, as: 'housingUnit', required: false },
        ],
        transaction: t,
      });
      if (!lead) throw { message: 'Lead tidak ditemukan, sudah bukan Deal, atau sudah ditautkan ke piutang.', status: 400 };
      if (!lead.housing_unit_id) {
        throw { message: 'Lead Deal harus memiliki unit kavling sebelum dibuat piutang.', status: 400 };
      }

      const unit = await HousingUnit.findOne({
        where: withTenantWhere({ id: lead.housing_unit_id }, actor),
        transaction: t,
      });
      if (!unit) throw { message: 'Unit kavling pada lead tidak ditemukan.', status: 404 };
      if (unit.consumer_id) {
        throw { message: 'Unit kavling ini sudah terikat ke konsumen/piutang lain.', status: 400 };
      }
      if (unit.reserved_lead_id !== lead.id) {
        throw { message: 'Unit harus terkunci oleh lead ini sebelum dibuat piutang.', status: 400 };
      }
      if (unit.status !== 'Proses') {
        throw { message: 'Unit harus berstatus Proses sebelum dibuat piutang.', status: 400 };
      }
      if (unit.harga_jual == null) {
        throw { message: 'Unit kavling belum memiliki harga jual. Lengkapi data kavling di modul Perumahan.', status: 400 };
      }

      const consumer = await Consumer.create({
        company_id: companyId,
        lead_id: lead.id,
        name: lead.name,
        phone: lead.phone || null,
        email: lead.email || null,
        nik,
        address,
        unit_code: unit.unit_code,
        project_id: unit.project_id || lead.project_id || null,
        total_price: unit.harga_jual,
        payment_scheme,
        paid_amount: 0,
        status: 'Aktif',
      }, { transaction: t });

      // Note: housing_units tidak lagi memiliki consumer_id secara fisik.
      // Jika butuh menyimpan referensi, sudah ada reserved_lead_id.
      // Kode sebelumnya: await unit.update({ consumer_id: consumer.id }, { transaction: t });
      // kita cukup tidak melakukan apa-apa karena reserved_lead_id sudah diset saat booking.
      const [n] = await Lead.update(
        { consumer_id: consumer.id },
        { where: { id: lead_id, consumer_id: null }, transaction: t },
      );
      if (!n) throw { message: 'Lead sudah digunakan piutang lain. Muat ulang daftar lead.', status: 409 };

      await t.commit();
      return consumer;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  updateConsumer: async (id, payload, actor) => {
    const c = await Consumer.findOne({ where: withTenantWhere({ id }, actor) });
    if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };
    const safe = stripCompanyId(payload);
    const allowed = {};
    for (const key of ['nik', 'address', 'payment_scheme', 'status']) {
      if (safe[key] !== undefined) allowed[key] = safe[key];
    }
    await c.update(allowed);
    return c;
  },

  removeConsumer: async (id, actor) => {
    const t = await sequelize.transaction();
    try {
      const c = await Consumer.findOne({ where: withTenantWhere({ id }, actor), transaction: t });
      if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };

      await PaymentHistory.destroy({ where: { consumer_id: id }, transaction: t });
      await Lead.update({ consumer_id: null }, { where: { consumer_id: id }, transaction: t });

      // Setelah semua pembayaran dihapus, unit tidak lagi Sold.
      const unit = await HousingUnit.findOne({
        where: withTenantWhere({ reserved_lead_id: c.lead_id }, actor),
        transaction: t,
      });
      const nextUnitStatus = unit?.reserved_lead_id ? 'Proses' : 'Tersedia';

      await HousingUnit.update(
        { status: nextUnitStatus },
        { where: withTenantWhere({ reserved_lead_id: c.lead_id }, actor), transaction: t },
      );
      await c.destroy({ transaction: t });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
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
    const t = await sequelize.transaction();
    try {
      const c = await Consumer.findOne({
        where: withTenantWhere({ id: consumerId }, actor),
        transaction: t,
      });
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

      const payment = await PaymentHistory.create(createPayload, { transaction: t });
      const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId }, transaction: t });

      const paid_amount = total || 0;
      const total_price = c.total_price != null ? Number(c.total_price) : 0;
      const isLunas = total_price > 0 && Number(paid_amount) >= total_price;

      const nextConsumerStatus = isLunas ? 'Lunas' : (c.status === 'Dibatalkan' ? 'Dibatalkan' : 'Aktif');
      await c.update({ paid_amount, status: nextConsumerStatus }, { transaction: t });

      // Sinkronisasi unit: Sold hanya jika lunas; kalau belum lunas kembali Proses/Tersedia.
      const housingUnit = await HousingUnit.findOne({
        where: withTenantWhere({ reserved_lead_id: c.lead_id }, actor),
        transaction: t,
      });
      if (housingUnit) {
        const nextHousingStatus = isLunas
          ? 'Sold'
          : (housingUnit.reserved_lead_id ? 'Proses' : 'Tersedia');
        await housingUnit.update({ status: nextHousingStatus }, { transaction: t });
      }

      await t.commit();
      return payment;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  updatePayment: async (consumerId, paymentId, payload, actor) => {
    const t = await sequelize.transaction();
    try {
      const c = await Consumer.findOne({
        where: withTenantWhere({ id: consumerId }, actor),
        transaction: t,
      });
      if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };

      const p = await PaymentHistory.findOne({
        where: { id: paymentId, consumer_id: consumerId },
        transaction: t,
      });
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

      await p.update(updateData, { transaction: t });

      const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId }, transaction: t });
      const paid_amount = total || 0;
      const total_price = c.total_price != null ? Number(c.total_price) : 0;
      const isLunas = total_price > 0 && Number(paid_amount) >= total_price;

      const nextConsumerStatus = isLunas ? 'Lunas' : (c.status === 'Dibatalkan' ? 'Dibatalkan' : 'Aktif');
      await c.update({ paid_amount, status: nextConsumerStatus }, { transaction: t });

      const housingUnit = await HousingUnit.findOne({
        where: withTenantWhere({ reserved_lead_id: c.lead_id }, actor),
        transaction: t,
      });
      if (housingUnit) {
        const nextHousingStatus = isLunas
          ? 'Sold'
          : (housingUnit.reserved_lead_id ? 'Proses' : 'Tersedia');
        await housingUnit.update({ status: nextHousingStatus }, { transaction: t });
      }

      await t.commit();
      return p;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  removePayment: async (consumerId, paymentId, actor) => {
    const t = await sequelize.transaction();
    try {
      const c = await Consumer.findOne({
        where: withTenantWhere({ id: consumerId }, actor),
        transaction: t,
      });
      if (!c) throw { message: 'Konsumen tidak ditemukan', status: 404 };

      const p = await PaymentHistory.findOne({
        where: { id: paymentId, consumer_id: consumerId },
        transaction: t,
      });
      if (!p) throw { message: 'Riwayat pembayaran tidak ditemukan', status: 404 };

      await p.destroy({ transaction: t });

      const total = await PaymentHistory.sum('amount', { where: { consumer_id: consumerId }, transaction: t });
      const paid_amount = total || 0;
      const total_price = c.total_price != null ? Number(c.total_price) : 0;
      const isLunas = total_price > 0 && Number(paid_amount) >= total_price;

      const nextConsumerStatus = isLunas ? 'Lunas' : (c.status === 'Dibatalkan' ? 'Dibatalkan' : 'Aktif');
      await c.update({ paid_amount, status: nextConsumerStatus }, { transaction: t });

      const housingUnit = await HousingUnit.findOne({
        where: withTenantWhere({ reserved_lead_id: c.lead_id }, actor),
        transaction: t,
      });
      if (housingUnit) {
        const nextHousingStatus = isLunas
          ? 'Sold'
          : (housingUnit.reserved_lead_id ? 'Proses' : 'Tersedia');
        await housingUnit.update({ status: nextHousingStatus }, { transaction: t });
      }

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
