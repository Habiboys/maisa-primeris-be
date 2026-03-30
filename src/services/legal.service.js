'use strict';

const { Op }   = require('sequelize');
const { Ppjb, Akad, Bast, PindahUnit, Pembatalan, Consumer, HousingUnit, Lead, MarketingPerson } = require('../models');
const { withTenantWhere, requireCompanyId, stripCompanyId } = require('../utils/tenant');

/** Resolve consumer_id (dan opsional housing_unit_id) dari lead Deal milik tenant yang sama. */
const resolveLeadForLegal = async (payload, actor, modelName) => {
  if (!payload.lead_id) return { ...payload };
  const lead = await Lead.findOne({
    where: { id: payload.lead_id },
    include: [{
      model: MarketingPerson,
      as: 'marketingPerson',
      attributes: ['id'],
      where: withTenantWhere({}, actor),
      required: true,
    }],
  });
  if (!lead) throw { message: 'Lead tidak ditemukan atau bukan untuk perusahaan ini', status: 404 };
  if (lead.status !== 'Deal') throw { message: 'Hanya lead berstatus Deal yang bisa dipakai untuk dokumen legal', status: 400 };
  if (!lead.consumer_id) throw { message: 'Lead belum memiliki data konsumen. Selesaikan konversi piutang di Finance terlebih dahulu.', status: 400 };
  const c = await Consumer.findOne({ where: withTenantWhere({ id: lead.consumer_id }, actor) });
  if (!c) throw { message: 'Konsumen tidak valid untuk perusahaan ini', status: 400 };

  const { lead_id: _lid, ...rest } = payload;
  const out = { ...rest, consumer_id: lead.consumer_id };
  const isPindah = modelName === 'PindahUnit';
  if (!isPindah && lead.housing_unit_id && !out.housing_unit_id) {
    out.housing_unit_id = lead.housing_unit_id;
  }
  return out;
};

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};
const searchWhere = (search, fields) => search
  ? { [Op.or]: fields.map(f => ({ [f]: { [Op.like]: `%${search}%` } })) }
  : {};

// ── Generic CRUD helpers ──────────────────────────────────────────

const consumerInclude = { model: Consumer, as: 'consumer', attributes: ['id', 'name', 'nik', 'phone', 'email'] };
const housingInclude  = { model: HousingUnit, as: 'housingUnit', attributes: ['id', 'unit_code', 'unit_type', 'luas_tanah', 'luas_bangunan', 'project_id'] };
const housingUnitLamaInclude = { model: HousingUnit, as: 'housingUnitLama', attributes: ['id', 'unit_code', 'unit_type', 'project_id'] };
const housingUnitBaruInclude = { model: HousingUnit, as: 'housingUnitBaru', attributes: ['id', 'unit_code', 'unit_type', 'project_id'] };

const withTenantIncludes = (includes, actor) => includes.map((inc) => {
  if (inc.as === 'consumer') {
    return { ...inc, where: withTenantWhere({}, actor), required: false };
  }
  if (inc.as === 'housingUnit' || inc.as === 'housingUnitLama' || inc.as === 'housingUnitBaru') {
    return { ...inc, where: withTenantWhere({}, actor), required: false };
  }
  return inc;
});

const HOUSING_UNIT_KEYS = ['housing_unit_id', 'housing_unit_id_lama', 'housing_unit_id_baru'];
const validateHousingUnitIds = async (payload, actor) => {
  for (const key of HOUSING_UNIT_KEYS) {
    if (!payload[key]) continue;
    const h = await HousingUnit.findOne({ where: withTenantWhere({ id: payload[key] }, actor) });
    if (!h) throw { message: 'Unit lintas perusahaan tidak diizinkan', status: 400 };
  }
};

const makeCRUD = (Model, notFoundMsg, searchFields = [], includes = []) => ({
  list: async ({ search, page, limit, date_from, date_to } = {}, actor) => {
    const where = search ? searchWhere(search, searchFields) : {};
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to)   where.created_at[Op.lte] = new Date(`${date_to}T23:59:59`);
    }
    const tenantWhere = withTenantWhere(where, actor);
    const { count, rows } = await Model.findAndCountAll({
      where: tenantWhere,
      include: withTenantIncludes(includes, actor),
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },
  getById: async (id, actor) => {
    const r = await Model.findOne({ where: withTenantWhere({ id }, actor), include: withTenantIncludes(includes, actor) });
    if (!r) throw { message: notFoundMsg, status: 404 };
    return r;
  },
  create:  async (payload, actor) => {
    const p = await resolveLeadForLegal(payload, actor, Model.name);
    if (p.consumer_id) {
      const c = await Consumer.findOne({ where: withTenantWhere({ id: p.consumer_id }, actor) });
      if (!c) throw { message: 'Konsumen lintas perusahaan tidak diizinkan', status: 400 };
    }
    await validateHousingUnitIds(p, actor);
    const company_id = requireCompanyId(actor);
    const safePayload = { ...stripCompanyId(p), company_id };
    return Model.create(safePayload);
  },
  update:  async (id, payload, actor) => {
    const r = await Model.findOne({ where: withTenantWhere({ id }, actor), include: withTenantIncludes(includes, actor) });
    if (!r) throw { message: notFoundMsg, status: 404 };

    const p = await resolveLeadForLegal(payload, actor, Model.name);
    if (p.consumer_id) {
      const c = await Consumer.findOne({ where: withTenantWhere({ id: p.consumer_id }, actor) });
      if (!c) throw { message: 'Konsumen lintas perusahaan tidak diizinkan', status: 400 };
    }
    await validateHousingUnitIds(p, actor);

    await r.update(stripCompanyId(p));
    return r;
  },
  remove:  async (id, actor) => {
    const r = await Model.findOne({ where: withTenantWhere({ id }, actor), include: withTenantIncludes(includes, actor) });
    if (!r) throw { message: notFoundMsg, status: 404 };
    await r.destroy();
  },
});

module.exports = {
  ppjb      : makeCRUD(Ppjb,       'PPJB tidak ditemukan',        ['nomor_ppjb'],        [consumerInclude, housingInclude]),
  akad      : makeCRUD(Akad,       'Akad tidak ditemukan',        ['nomor_akad'],         [consumerInclude, housingInclude]),
  bast      : makeCRUD(Bast,       'BAST tidak ditemukan',        ['nomor_bast'],         [consumerInclude, housingInclude]),
  pindahUnit: makeCRUD(PindahUnit, 'Pindah unit tidak ditemukan', ['unit_lama', 'unit_baru'], [consumerInclude, housingUnitLamaInclude, housingUnitBaruInclude]),
  pembatalan: makeCRUD(Pembatalan, 'Pembatalan tidak ditemukan',  ['unit_code'],          [consumerInclude, housingInclude]),
};
