'use strict';

const { Op } = require('sequelize');
const {
  PermintaanMaterial, PermintaanMaterialItem,
  TandaTerimaGudang, TandaTerimaGudangItem,
  BarangKeluar, BarangKeluarItem,
  InventarisLapangan,
  SuratJalan, SuratJalanItem,
  User,
} = require('../models');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

module.exports = {
  // ── Permintaan Material ────────────────────────────────────────

  listPermintaan: async ({ status, page, limit } = {}) => {
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await PermintaanMaterial.findAndCountAll({
      where,
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'] },
      ],
      order: [['request_date', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getPermintaanById: async (id) => {
    const r = await PermintaanMaterial.findByPk(id, {
      include: [
        { model: PermintaanMaterialItem, as: 'items' },
        { model: User, as: 'requester', attributes: ['id', 'name'] },
      ],
    });
    if (!r) throw { message: 'Permintaan material tidak ditemukan', status: 404 };
    return r;
  },

  createPermintaan: async (payload, userId) => {
    const { items = [], ...body } = payload;
    const pm = await PermintaanMaterial.create({ ...body, requested_by: userId, status: 'Diajukan' });
    if (items.length) await PermintaanMaterialItem.bulkCreate(items.map(i => ({ ...i, permintaan_material_id: pm.id })));
    return pm;
  },

  approvePermintaan: async (id) => {
    const pm = await PermintaanMaterial.findByPk(id);
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Disetujui' });
    return pm;
  },

  rejectPermintaan: async (id) => {
    const pm = await PermintaanMaterial.findByPk(id);
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await pm.update({ status: 'Ditolak' });
    return pm;
  },

  removePermintaan: async (id) => {
    const pm = await PermintaanMaterial.findByPk(id);
    if (!pm) throw { message: 'Permintaan tidak ditemukan', status: 404 };
    await PermintaanMaterialItem.destroy({ where: { permintaan_material_id: id } });
    await pm.destroy();
  },

  // ── Tanda Terima Gudang ────────────────────────────────────────

  listTTG: async ({ status, page, limit } = {}) => {
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await TandaTerimaGudang.findAndCountAll({
      where,
      include: [{ model: TandaTerimaGudangItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createTTG: async (payload, userId) => {
    const { items = [], ...body } = payload;
    const ttg = await TandaTerimaGudang.create({ ...body, received_by: userId });
    if (items.length) await TandaTerimaGudangItem.bulkCreate(items.map(i => ({ ...i, tanda_terima_gudang_id: ttg.id })));
    return ttg;
  },

  verifyTTG: async (id) => {
    const ttg = await TandaTerimaGudang.findByPk(id);
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await ttg.update({ status: 'Selesai' });
    return ttg;
  },

  removeTTG: async (id) => {
    const ttg = await TandaTerimaGudang.findByPk(id);
    if (!ttg) throw { message: 'TTG tidak ditemukan', status: 404 };
    await TandaTerimaGudangItem.destroy({ where: { tanda_terima_gudang_id: id } });
    await ttg.destroy();
  },

  // ── Barang Keluar ──────────────────────────────────────────────

  listBarangKeluar: async ({ status, page, limit } = {}) => {
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await BarangKeluar.findAndCountAll({
      where,
      include: [
        { model: BarangKeluarItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createBarangKeluar: async (payload, userId) => {
    const { items = [], ...body } = payload;
    const bk = await BarangKeluar.create({ ...body, issued_by: userId });
    if (items.length) await BarangKeluarItem.bulkCreate(items.map(i => ({ ...i, barang_keluar_id: bk.id })));
    return bk;
  },

  removeBarangKeluar: async (id) => {
    const bk = await BarangKeluar.findByPk(id);
    if (!bk) throw { message: 'Barang keluar tidak ditemukan', status: 404 };
    await BarangKeluarItem.destroy({ where: { barang_keluar_id: id } });
    await bk.destroy();
  },

  // ── Inventaris Lapangan ────────────────────────────────────────

  listInventaris: async ({ kategori, kondisi, search, page, limit } = {}) => {
    const where = {};
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

  getInventarisById: async (id) => {
    const r = await InventarisLapangan.findByPk(id);
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    return r;
  },

  createInventaris: async (payload) => InventarisLapangan.create(payload),

  updateInventaris: async (id, payload) => {
    const r = await InventarisLapangan.findByPk(id);
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    await r.update(payload);
    return r;
  },

  removeInventaris: async (id) => {
    const r = await InventarisLapangan.findByPk(id);
    if (!r) throw { message: 'Inventaris tidak ditemukan', status: 404 };
    await r.destroy();
  },

  // ── Surat Jalan ────────────────────────────────────────────────

  listSuratJalan: async ({ status, page, limit } = {}) => {
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await SuratJalan.findAndCountAll({
      where,
      include: [
        { model: SuratJalanItem, as: 'items' },
        { model: User, as: 'issuer', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createSuratJalan: async (payload, userId) => {
    const { items = [], ...body } = payload;
    const sj = await SuratJalan.create({ ...body, issued_by: userId });
    if (items.length) await SuratJalanItem.bulkCreate(items.map(i => ({ ...i, surat_jalan_id: sj.id })));
    return sj;
  },

  updateSuratJalanStatus: async (id, status) => {
    const sj = await SuratJalan.findByPk(id);
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await sj.update({ status });
    return sj;
  },

  removeSuratJalan: async (id) => {
    const sj = await SuratJalan.findByPk(id);
    if (!sj) throw { message: 'Surat jalan tidak ditemukan', status: 404 };
    await SuratJalanItem.destroy({ where: { surat_jalan_id: id } });
    await sj.destroy();
  },
};
