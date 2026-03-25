'use strict';

const { Op } = require('sequelize');
const { Lead, MarketingPerson, UnitStatus, User, HousingUnit } = require('../models');
const { withTenantWhere, requireCompanyId, isPlatformOwner } = require('../utils/tenant');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

const buildDefaultUnitStatuses = (companyId) => {
  const rows = [];
  for (let i = 0; i < 40; i += 1) {
    const block = i < 20 ? 'A' : 'B';
    const num = String((i % 20) + 1).padStart(2, '0');
    rows.push({
      company_id: companyId,
      unit_code: `${block}-${num}`,
      project_id: null,
      status: 'Tersedia',
      consumer_id: null,
      price: 750000000,
      notes: null,
    });
  }
  return rows;
};

const ensureTenantUnitStatuses = async (actor) => {
  if (isPlatformOwner(actor) || !actor?.company_id) return;

  const count = await UnitStatus.count({ where: { company_id: actor.company_id } });
  if (count > 0) return;

  await UnitStatus.bulkCreate(buildDefaultUnitStatuses(actor.company_id));
};

module.exports = {
  // ── Leads ──────────────────────────────────────────────────────

  listLeads: async ({ search, status, source, marketing_id, project_id, page, limit } = {}, actor) => {
    const where = {};
    if (search)      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }, { interest: { [Op.like]: `%${search}%` } }];
    if (status)      where.status      = status;
    if (source)      where.source      = source;
    if (marketing_id) where.marketing_id = marketing_id;

    const marketingWhere = withTenantWhere({}, actor);
    const housingInclude = {
      model: HousingUnit,
      as: 'housingUnit',
      attributes: ['id', 'unit_code', 'unit_type', 'project_id'],
      required: false,
      where: project_id ? withTenantWhere({ project_id }, actor) : undefined,
    };
    if (project_id) housingInclude.required = true;

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'], where: marketingWhere, required: true },
        housingInclude,
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getLeadById: async (id, actor) => {
    const l = await Lead.findOne({
      where: { id },
      include: [
        { model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
        { model: HousingUnit, as: 'housingUnit', attributes: ['id', 'unit_code', 'unit_type', 'project_id'], required: false },
      ],
    });
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    return l;
  },

  createLead: async (payload, actor) => {
    const marketing = await MarketingPerson.findOne({
      where: withTenantWhere({ id: payload.marketing_id }, actor),
    });
    if (!marketing) throw { message: 'Marketing person tidak ditemukan untuk perusahaan ini', status: 404 };
    if (payload.housing_unit_id) {
      const h = await HousingUnit.findOne({ where: withTenantWhere({ id: payload.housing_unit_id }, actor) });
      if (!h) throw { message: 'Unit tidak ditemukan untuk perusahaan ini', status: 404 };
    }
    return Lead.create(payload);
  },

  updateLead: async (id, payload, actor) => {
    const l = await Lead.findOne({
      where: { id },
      include: [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }],
    });
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };

    if (payload.marketing_id) {
      const marketing = await MarketingPerson.findOne({
        where: withTenantWhere({ id: payload.marketing_id }, actor),
      });
      if (!marketing) throw { message: 'Marketing person tidak ditemukan untuk perusahaan ini', status: 404 };
    }
    if (payload.housing_unit_id !== undefined) {
      if (payload.housing_unit_id) {
        const h = await HousingUnit.findOne({ where: withTenantWhere({ id: payload.housing_unit_id }, actor) });
        if (!h) throw { message: 'Unit tidak ditemukan untuk perusahaan ini', status: 404 };
      }
    }

    await l.update(payload);
    return l;
  },

  removeLead: async (id, actor) => {
    const l = await Lead.findOne({
      where: { id },
      include: [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }],
    });
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    await l.destroy();
  },

  getLeadStats: async (actor) => {
    const includeTenant = [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }];
    const [total, hot, deal, batal] = await Promise.all([
      Lead.count({ include: includeTenant }),
      Lead.count({ where: { status: 'Negoisasi' }, include: includeTenant }),
      Lead.count({ where: { status: 'Deal' }, include: includeTenant }),
      Lead.count({ where: { status: 'Batal' }, include: includeTenant }),
    ]);
    const closing_rate = total > 0 ? Math.round((deal / total) * 100) : 0;
    return { total, hot, closing_rate, batal };
  },

  // ── Marketing Persons ──────────────────────────────────────────

  listMarketingPersons: async ({ is_active, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

    const { count, rows } = await MarketingPerson.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMarketingPersonById: async (id, actor) => {
    const mp = await MarketingPerson.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    return mp;
  },

  createMarketingPerson: async (payload, actor) => MarketingPerson.create({ ...payload, company_id: requireCompanyId(actor) }),

  updateMarketingPerson: async (id, payload, actor) => {
    const mp = await MarketingPerson.findOne({ where: withTenantWhere({ id }, actor) });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.update(payload);
    return mp;
  },

  removeMarketingPerson: async (id, actor) => {
    const mp = await MarketingPerson.findOne({ where: withTenantWhere({ id }, actor) });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.destroy();
  },

  // ── Unit Statuses (siteplan) ───────────────────────────────────

  listUnitStatuses: async (actor) => {
    await ensureTenantUnitStatuses(actor);
    return UnitStatus.findAll({ where: withTenantWhere({}, actor), order: [['unit_code', 'ASC']] });
  },

  updateUnitStatus: async (unitCode, payload, actor) => {
    const us = await UnitStatus.findOne({ where: withTenantWhere({ unit_code: unitCode }, actor) });
    if (!us) throw { message: 'Unit tidak ditemukan', status: 404 };
    await us.update(payload);
    return us;
  },
};
