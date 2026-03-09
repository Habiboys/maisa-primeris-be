'use strict';

const { Op } = require('sequelize');
const { Lead, MarketingPerson, UnitStatus, User } = require('../models');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

module.exports = {
  // ── Leads ──────────────────────────────────────────────────────

  listLeads: async ({ search, status, source, marketing_id, page, limit } = {}) => {
    const where = {};
    if (search)      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }];
    if (status)      where.status      = status;
    if (source)      where.source      = source;
    if (marketing_id) where.marketing_id = marketing_id;

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [{ model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getLeadById: async (id) => {
    const l = await Lead.findByPk(id, {
      include: [{ model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'] }],
    });
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    return l;
  },

  createLead: async (payload) => Lead.create(payload),

  updateLead: async (id, payload) => {
    const l = await Lead.findByPk(id);
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    await l.update(payload);
    return l;
  },

  removeLead: async (id) => {
    const l = await Lead.findByPk(id);
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    await l.destroy();
  },

  getLeadStats: async () => {
    const [total, hot, deal, batal] = await Promise.all([
      Lead.count(),
      Lead.count({ where: { status: 'Negoisasi' } }),
      Lead.count({ where: { status: 'Deal' } }),
      Lead.count({ where: { status: 'Batal' } }),
    ]);
    const closing_rate = total > 0 ? Math.round((deal / total) * 100) : 0;
    return { total, hot, closing_rate, batal };
  },

  // ── Marketing Persons ──────────────────────────────────────────

  listMarketingPersons: async ({ is_active, page, limit } = {}) => {
    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

    const { count, rows } = await MarketingPerson.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMarketingPersonById: async (id) => {
    const mp = await MarketingPerson.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    return mp;
  },

  createMarketingPerson: async (payload) => MarketingPerson.create(payload),

  updateMarketingPerson: async (id, payload) => {
    const mp = await MarketingPerson.findByPk(id);
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.update(payload);
    return mp;
  },

  removeMarketingPerson: async (id) => {
    const mp = await MarketingPerson.findByPk(id);
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.destroy();
  },

  // ── Unit Statuses (siteplan) ───────────────────────────────────

  listUnitStatuses: async () => UnitStatus.findAll({ order: [['unit_code', 'ASC']] }),

  updateUnitStatus: async (unitCode, payload) => {
    const us = await UnitStatus.findOne({ where: { unit_code: unitCode } });
    if (!us) throw { message: 'Unit tidak ditemukan', status: 404 };
    await us.update(payload);
    return us;
  },
};
