'use strict';

const { Op }   = require('sequelize');
const { Ppjb, Akad, Bast, PindahUnit, Pembatalan, Consumer, HousingUnit } = require('../models');

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
const housingInclude  = { model: HousingUnit, as: 'housingUnit', attributes: ['id', 'unit_code', 'unit_type', 'luas_tanah', 'luas_bangunan'] };

const makeCRUD = (Model, notFoundMsg, searchFields = [], includes = []) => ({
  list: async ({ search, page, limit, date_from, date_to } = {}) => {
    const where = search ? searchWhere(search, searchFields) : {};
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to)   where.created_at[Op.lte] = new Date(`${date_to}T23:59:59`);
    }
    const { count, rows } = await Model.findAndCountAll({ where, include: includes, order: [['created_at', 'DESC']], ...paginate(page, limit) });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },
  getById: async (id) => {
    const r = await Model.findByPk(id, { include: includes });
    if (!r) throw { message: notFoundMsg, status: 404 };
    return r;
  },
  create:  async (payload) => Model.create(payload),
  update:  async (id, payload) => {
    const r = await Model.findByPk(id);
    if (!r) throw { message: notFoundMsg, status: 404 };
    await r.update(payload);
    return r;
  },
  remove:  async (id) => {
    const r = await Model.findByPk(id);
    if (!r) throw { message: notFoundMsg, status: 404 };
    await r.destroy();
  },
});

module.exports = {
  ppjb      : makeCRUD(Ppjb,       'PPJB tidak ditemukan',        ['nomor_ppjb'],        [consumerInclude, housingInclude]),
  akad      : makeCRUD(Akad,       'Akad tidak ditemukan',        ['nomor_akad'],         [consumerInclude, housingInclude]),
  bast      : makeCRUD(Bast,       'BAST tidak ditemukan',        ['nomor_bast'],         [consumerInclude, housingInclude]),
  pindahUnit: makeCRUD(PindahUnit, 'Pindah unit tidak ditemukan', ['unit_lama', 'unit_baru'], [consumerInclude]),
  pembatalan: makeCRUD(Pembatalan, 'Pembatalan tidak ditemukan',  ['unit_code'],          [consumerInclude]),
};
