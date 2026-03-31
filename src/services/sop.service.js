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
    const where = { company_id: actor.company_id };
    if (status) where.status = status;
    const { count, rows } = await PermintaanMaterial.findAndCountAll({
      where,
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
      order: [['request_date', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getPermintaanById: async (id, actor) => {
    const r = await PermintaanMaterial.findOne({
      where: { id, company_id: actor.company_id },
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
    });
    if (!r) throw { message: 'Permintaan material tidak ditemukan', status: 404 };
    return r;
  },

  createPermintaan: async (payload, userId, actor) => {
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const pm = await PermintaanMaterial.create({ ...body, company_id: actor.company_id, requested_by: userId, status: 'Diajukan' });
    if (items.length) await PermintaanMaterialItem.bulkCreate(items.map(i => ({ ...i, permintaan_material_id: pm.id })));
    return pm;
  },

  updatePermintaan: async (id, payload, actor) => {
    const pm = await PermintaanMaterial.findOne({ where: { id, company_id: actor.company_id } });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    if (['Selesai', 'Disetujui', 'Ditolak'].includes(pm.status)) throw { message: `Tidak dapat memodifikasi dokumen dengan status ${pm.status}`, status: 400 };

    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    const { items, ...body } = payload;
    await pm.update(body);

    if (items && Array.isArray(items)) {
      await PermintaanMaterialItem.destroy({ where: { permintaan_material_id: id } });
      if (items.length) await PermintaanMaterialItem.bulkCreate(items.map(i => ({ ...i, permintaan_material_id: id })));
    }
    return pm;
  },

  approvePermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({ where: { id, company_id: actor.company_id } });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Disetujui' });
    return pm;
  },

  rejectPermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({ where: { id, company_id: actor.company_id } });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Ditolak' });
    return pm;
  },

  removePermintaan: async (id, actor) => {
    const pm = await PermintaanMaterial.findOne({ where: { id, company_id: actor.company_id } });
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await PermintaanMaterialItem.destroy({ where: { permintaan_material_id: id } });
    await pm.destroy();
  },

  // ── Tanda Terima Gudang ────────────────────────────────────────

  getTTGById: async (id, actor) => {
    const r = await TandaTerimaGudang.findOne({
      where: { id, company_id: actor.company_id },
      include: [
        { model: TandaTerimaGudangItem, as: 'items' },
        { model: User, as: 'receiver', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
    });
    if (!r) throw { message: 'TTG tidak ditemukan', status: 404 };
    return r;
  },

  listTTG: async ({ status, page, limit } = {}, actor) => {
    const where = { company_id: actor.company_id };
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
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const ttg = await TandaTerimaGudang.create({ ...body, company_id: actor.company_id, received_by: userId });
    if (items.length) await TandaTerimaGudangItem.bulkCreate(items.map(i => ({ ...i, tanda_terima_gudang_id: ttg.id })));
    return ttg;
  },

  updateTTG: async (id, payload, actor) => {
    const ttg = await TandaTerimaGudang.findOne({ where: { id, company_id: actor.company_id } });
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    if (ttg.status === 'Selesai') throw { message: 'Tidak dapat memodifikasi dokumen yang sudah Selesai', status: 400 };

    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    const { items, ...body } = payload;
    await ttg.update(body);

    if (items && Array.isArray(items)) {
      await TandaTerimaGudangItem.destroy({ where: { tanda_terima_gudang_id: id } });
      if (items.length) await TandaTerimaGudangItem.bulkCreate(items.map(i => ({ ...i, tanda_terima_gudang_id: id })));
    }
    return ttg;
  },

  verifyTTG: async (id, actor) => {
    const ttg = await TandaTerimaGudang.findOne({ where: { id, company_id: actor.company_id } });
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await ttg.update({ status: 'Selesai' });
    return ttg;
  },

  removeTTG: async (id, actor) => {
    const ttg = await TandaTerimaGudang.findOne({ where: { id, company_id: actor.company_id } });
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await TandaTerimaGudangItem.destroy({ where: { tanda_terima_gudang_id: id } });
    await ttg.destroy();
  },

  // ── Barang Keluar ──────────────────────────────────────────────

  listBarangKeluar: async ({ status, page, limit } = {}, actor) => {
    const where = { company_id: actor.company_id };
    if (status) where.status = status;
    const { count, rows } = await BarangKeluar.findAndCountAll({
      where,
      include: [
        { model: BarangKeluarItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
        { model: Project, as: 'projectModel', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getBarangKeluarById: async (id, actor) => {
    const r = await BarangKeluar.findOne({
      where: { id, company_id: actor.company_id },
      include: [
        { model: BarangKeluarItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
        { model: Project, as: 'projectModel', attributes: ['id', 'name'] },
      ],
    });
    if (!r) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    return r;
  },

  verifyBarangKeluar: async (id, actor) => {
    const bk = await BarangKeluar.findOne({ where: { id, company_id: actor.company_id } });
    if (!bk) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    await bk.update({ status: 'Selesai' });
    return bk;
  },

  createBarangKeluar: async (payload, userId, actor) => {
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const bk = await BarangKeluar.create({ ...body, company_id: actor.company_id, issued_by: userId });
    if (items.length) await BarangKeluarItem.bulkCreate(items.map(i => ({ ...i, barang_keluar_id: bk.id })));
    return bk;
  },

  updateBarangKeluar: async (id, payload, actor) => {
    const bk = await BarangKeluar.findOne({ where: { id, company_id: actor.company_id } });
    if (!bk) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    if (bk.status === 'Selesai') throw { message: 'Tidak dapat memodifikasi dokumen yang sudah Selesai', status: 400 };

    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    const { items, ...body } = payload;
    await bk.update(body);

    if (items && Array.isArray(items)) {
      await BarangKeluarItem.destroy({ where: { barang_keluar_id: id } });
      if (items.length) await BarangKeluarItem.bulkCreate(items.map(i => ({ ...i, barang_keluar_id: id })));
    }
    return bk;
  },

  removeBarangKeluar: async (id, actor) => {
    const bk = await BarangKeluar.findOne({ where: { id, company_id: actor.company_id } });
    if (!bk) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    await BarangKeluarItem.destroy({ where: { barang_keluar_id: id } });
    await bk.destroy();
  },

  // ── Inventaris Lapangan ────────────────────────────────────────

  listInventaris: async ({ kategori, kondisi, search, page, limit } = {}, actor) => {
    const where = { company_id: actor.company_id };
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
    const r = await InventarisLapangan.findOne({ where: { id, company_id: actor.company_id } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    return r;
  },

  createInventaris: async (payload, actor) => {
    await module.exports._ensureProject(payload.project_id, actor);
    return InventarisLapangan.create({ ...payload, company_id: actor.company_id });
  },

  updateInventaris: async (id, payload, actor) => {
    const r = await InventarisLapangan.findOne({ where: { id, company_id: actor.company_id } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    await r.update(payload);
    return r;
  },

  removeInventaris: async (id, actor) => {
    const r = await InventarisLapangan.findOne({ where: { id, company_id: actor.company_id } });
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    await r.destroy();
  },

  // ── Surat Jalan ────────────────────────────────────────────────

  listSuratJalan: async ({ status, page, limit } = {}, actor) => {
    const where = { company_id: actor.company_id };
    if (status) where.status = status;
    const { count, rows } = await SuratJalan.findAndCountAll({
      where,
      include: [
        { model: SuratJalanItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createSuratJalan: async (payload, userId, actor) => {
    await module.exports._ensureProject(payload.project_id, actor);
    const { items = [], ...body } = payload;
    const sj = await SuratJalan.create({ ...body, company_id: actor.company_id, issued_by: userId });
    if (items.length) await SuratJalanItem.bulkCreate(items.map(i => ({ ...i, surat_jalan_id: sj.id })));
    return sj;
  },

  updateSuratJalan: async (id, payload, actor) => {
    const sj = await SuratJalan.findOne({ where: { id, company_id: actor.company_id } });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    if (['Dikirim', 'Diterima'].includes(sj.status)) throw { message: `Tidak dapat memodifikasi dokumen dengan status ${sj.status}`, status: 400 };

    if (payload.project_id) await module.exports._ensureProject(payload.project_id, actor);
    const { items, ...body } = payload;
    await sj.update(body);

    if (items && Array.isArray(items)) {
      await SuratJalanItem.destroy({ where: { surat_jalan_id: id } });
      if (items.length) await SuratJalanItem.bulkCreate(items.map(i => ({ ...i, surat_jalan_id: id })));
    }
    return sj;
  },

  updateSuratJalanStatus: async (id, status, actor) => {
    const sj = await SuratJalan.findOne({ where: { id, company_id: actor.company_id } });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await sj.update({ status });
    return sj;
  },

  getSuratJalanById: async (id, actor) => {
    const sj = await SuratJalan.findOne({
      where: { id, company_id: actor.company_id },
      include: [
        { model: SuratJalanItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false },
      ],
    });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    return sj;
  },

  removeSuratJalan: async (id, actor) => {
    const sj = await SuratJalan.findOne({ where: { id, company_id: actor.company_id } });
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await SuratJalanItem.destroy({ where: { surat_jalan_id: id } });
    await sj.destroy();
  },
};
