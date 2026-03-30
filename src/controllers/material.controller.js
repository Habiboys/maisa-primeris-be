'use strict';
const db = require('../models');
const { success, created, error } = require('../utils/response');
const Material = db.Material;

module.exports = {
  listMaterials: async (req, res) => {
    try {
      const { company_id } = req.user;
      const data = await Material.findAll({
        where: { company_id },
        order: [['name', 'ASC']]
      });
      return success(res, data, 'Daftar Material');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  createMaterial: async (req, res) => {
    try {
      const { company_id } = req.user;
      const { name, unit, notes } = req.body;
      if (!name || !unit) return error(res, 'Nama material dan satuan harus diisi', 400);

      const data = await Material.create({ company_id, name, unit, notes });
      return created(res, data, 'Material berhasil ditambahkan');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  updateMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;
      const { name, unit, notes } = req.body;

      const curr = await Material.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      if (name) curr.name = name;
      if (unit) curr.unit = unit;
      if (notes !== undefined) curr.notes = notes;

      await curr.save();
      return success(res, curr, 'Material berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  deleteMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;

      const curr = await Material.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      await curr.destroy();
      return success(res, null, 'Material berhasil dihapus');
    } catch (e) {
      return error(res, e.message, 500);
    }
  }
};
