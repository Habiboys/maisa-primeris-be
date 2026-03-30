'use strict';
const db = require('../models');
const { success, created, error } = require('../utils/response');
const Department = db.Department;

module.exports = {
  listDepartments: async (req, res) => {
    try {
      const { company_id } = req.user;
      const data = await Department.findAll({
        where: { company_id },
        order: [['name', 'ASC']]
      });
      return success(res, data, 'Daftar Divisi/Departemen');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  createDepartment: async (req, res) => {
    try {
      const { company_id } = req.user;
      const { name, description } = req.body;
      if (!name) return error(res, 'Nama divisi harus diisi', 400);

      const data = await Department.create({ company_id, name, description });
      return created(res, data, 'Divisi berhasil ditambahkan');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;
      const { name, description } = req.body;

      const curr = await Department.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      if (name) curr.name = name;
      if (description !== undefined) curr.description = description;

      await curr.save();
      return success(res, curr, 'Divisi berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;
      
      const curr = await Department.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      await curr.destroy();
      return success(res, null, 'Divisi berhasil dihapus');
    } catch (e) {
      return error(res, e.message, 500);
    }
  }
};
