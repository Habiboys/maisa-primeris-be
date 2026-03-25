'use strict';

const { Op } = require('sequelize');
const {
  PermintaanMaterial, PermintaanMaterialItem,
  TandaTerimaGudang, TandaTerimaGudangItem,
  BarangKeluar, BarangKeluarItem,
  InventarisLapangan,
  SuratJalan, SuratJalanItem,
  User, Project,
} = require('../models');
const { withTenantWhere } = require('../utils/tenant');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

module.exports = {
  _tenantProjectIds: async (actor) => {
    const projects = await Project.findAll({ where: withTenantWhere({}, actor), attributes: ['id'] });
    return projects.map((p) => p.id);
  },

  // helper
  _ensureProject: async (projectId, actor) => {
    if (!projectId) return null;
    const p = await Project.findOne({ where: withTenantWhere({ id: projectId }, actor) });
    if (!p) throw { message: 'Project lintas perusahaan tidak diizinkan', status: 400 };
    return p;
  },

  // ── Permintaan Material ────────────────────────────────────────

  listPermintaan: async ({ status, page, limit } = {}, actor) => {
    const where = {};
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    where.project_id = { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] };
    if (status) where.status = status;
    const { count, rows } = await PermintaanMaterial.findAndCountAll({
      where,
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
      ],
      order: [['request_date', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getPermintaanById: async (id, actor) => {
    const r = await PermintaanMaterial.findOne({
      where: { id },
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
      ],
    });
    if (!r) throw { message: 'Permintaan material tidak ditemukan', status: 404 };
    return r;
  },

  createPermintaan: async (payload, userId, actor) => {
    if (!payload.project_id) {
      const tenantProjectIds = await module.exports._tenantProjectIds(actor);
      if (tenantProjectIds.length) payload.project_id = tenantProjectIds[0];
    }
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const pm = await PermintaanMaterial.create({ ...body, requested_by: userId, status: 'Diajukan' });
    if (items.length) await PermintaanMaterialItem.bulkCreate(items.map(i => ({ ...i, permintaan_material_id: pm.id })));
    return pm;
  },

  approvePermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({
      where: { id },
      include: [{ model: User, as: 'requester', where: withTenantWhere({}, actor), required: true }],
    });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Disetujui' });
    return pm;
  },

  rejectPermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({
      where: { id },
      include: [{ model: User, as: 'requester', where: withTenantWhere({}, actor), required: true }],
    });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Ditolak' });
    return pm;
  },

  removePermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({
      where: { id },
      include: [{ model: User, as: 'requester', where: withTenantWhere({}, actor), required: true }],
    });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await PermintaanMaterialItem.destroy({ where: { permintaan_material_id: id } });
    await pm.destroy();
  },

  // ── Tanda Terima Gudang ────────────────────────────────────────

  getTTGById: async (id, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const r = await TandaTerimaGudang.findOne({
      where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } },
      include: [
        { model: TandaTerimaGudangItem, as: 'items' },
        { model: User, as: 'receiver', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
    });
    if (!r) throw { message: 'TTG tidak ditemukan', status: 404 };
    return r;
  },

  listTTG: async ({ status, page, limit } = {}, actor) => {
    const where = {};
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    where.project_id = { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] };
    if (status) where.status = status;
    const { count, rows } = await TandaTerimaGudang.findAndCountAll({
      where,
      include: [{ model: TandaTerimaGudangItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createTTG: async (payload, userId, actor) => {
    if (!payload.project_id) {
      const tenantProjectIds = await module.exports._tenantProjectIds(actor);
      if (tenantProjectIds.length) payload.project_id = tenantProjectIds[0];
    }
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const ttg = await TandaTerimaGudang.create({ ...body, received_by: userId });
    if (items.length) await TandaTerimaGudangItem.bulkCreate(items.map(i => ({ ...i, tanda_terima_gudang_id: ttg.id })));
    return ttg;
  },

  verifyTTG: async (id, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const ttg = await TandaTerimaGudang.findOne({ where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } } });
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await ttg.update({ status: 'Selesai' });
    return ttg;
  },

  removeTTG: async (id, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const ttg = await TandaTerimaGudang.findOne({ where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } } });
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await TandaTerimaGudangItem.destroy({ where: { tanda_terima_gudang_id: id } });
    await ttg.destroy();
  },

  // ── Barang Keluar ──────────────────────────────────────────────

  listBarangKeluar: async ({ status, page, limit } = {}, actor) => {
    const where = {};
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    where.project_id = { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] };
    if (status) where.status = status;
    const { count, rows } = await BarangKeluar.findAndCountAll({
      where,
      include: [
        { model: BarangKeluarItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createBarangKeluar: async (payload, userId, actor) => {
    if (!payload.project_id) {
      const tenantProjectIds = await module.exports._tenantProjectIds(actor);
      if (tenantProjectIds.length) payload.project_id = tenantProjectIds[0];
    }
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const bk = await BarangKeluar.create({ ...body, issued_by: userId });
    if (items.length) await BarangKeluarItem.bulkCreate(items.map(i => ({ ...i, barang_keluar_id: bk.id })));
    return bk;
  },

  removeBarangKeluar: async (id, actor) => {
    const bk = await BarangKeluar.findOne({
      where: { id },
      include: [{ model: User, as: 'issuer', where: withTenantWhere({}, actor), required: true }],
    });
    if (!bk) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    await BarangKeluarItem.destroy({ where: { barang_keluar_id: id } });
    await bk.destroy();
  },

  // ── Inventaris Lapangan ────────────────────────────────────────

  listInventaris: async ({ kategori, kondisi, search, page, limit } = {}, actor) => {
    const where = {};
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    where.project_id = { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] };
    if (kategori) where.category = kategori;
    if (kondisi)  where.condition = kondisi;
    if (search)   where.item_name = { [Op.like]: `%${search}%` };
    const { count, rows } = await InventarisLapangan.findAndCountAll({
      where,
      order: [['item_name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getInventarisById: async (id, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const r = await InventarisLapangan.findOne({ where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    return r;
  },

  createInventaris: async (payload, actor) => {
    // Jika project_id tidak dikirim dari frontend, pakai project pertama milik tenant
    if (!payload.project_id) {
      const tenantProjectIds = await module.exports._tenantProjectIds(actor);
      if (tenantProjectIds.length) {
        payload.project_id = tenantProjectIds[0];
      }
    }
    await module.exports._ensureProject(payload.project_id, actor);
    return InventarisLapangan.create(payload);
  },

  updateInventaris: async (id, payload, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const r = await InventarisLapangan.findOne({ where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    await r.update(payload);
    return r;
  },

  removeInventaris: async (id, actor) => {
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    const r = await InventarisLapangan.findOne({ where: { id, project_id: { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] } } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    await r.destroy();
  },

  // ── Surat Jalan ────────────────────────────────────────────────

  listSuratJalan: async ({ status, page, limit } = {}, actor) => {
    const where = {};
    const tenantProjectIds = await module.exports._tenantProjectIds(actor);
    where.project_id = { [Op.in]: tenantProjectIds.length ? tenantProjectIds : ['__none__'] };
    if (status) where.status = status;
    const { count, rows } = await SuratJalan.findAndCountAll({
      where,
      include: [
        { model: SuratJalanItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createSuratJalan: async (payload, userId, actor) => {
    if (!payload.project_id) {
      const tenantProjectIds = await module.exports._tenantProjectIds(actor);
      if (tenantProjectIds.length) payload.project_id = tenantProjectIds[0];
    }
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const sj = await SuratJalan.create({ ...body, issued_by: userId });
    if (items.length) await SuratJalanItem.bulkCreate(items.map(i => ({ ...i, surat_jalan_id: sj.id })));
    return sj;
  },

  updateSuratJalanStatus: async (id, status, actor) => {
    const sj = await SuratJalan.findOne({
      where: { id },
      include: [{ model: User, as: 'issuer', where: withTenantWhere({}, actor), required: true }],
    });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await sj.update({ status });
    return sj;
  },

  getSuratJalanById: async (id, actor) => {
    const sj = await SuratJalan.findOne({
      where: { id },
      include: [
        { model: SuratJalanItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
    });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    return sj;
  },

  removeSuratJalan: async (id, actor) => {
    const sj = await SuratJalan.findOne({
      where: { id },
      include: [{ model: User, as: 'issuer', where: withTenantWhere({}, actor), required: true }],
    });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await SuratJalanItem.destroy({ where: { surat_jalan_id: id } });
    await sj.destroy();
  },
};
