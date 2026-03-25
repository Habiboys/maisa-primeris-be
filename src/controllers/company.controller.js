'use strict';

const svc = require('../services/company.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  list: async (req, res) => {
    try {
      const data = await svc.list(req.query);
      return success(res, data, 'Daftar perusahaan berhasil diambil');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getById: async (req, res) => {
    try {
      const data = await svc.getById(req.params.id);
      return success(res, data, 'Detail perusahaan berhasil diambil');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  create: async (req, res) => {
    try {
      const data = await svc.create(req.body);
      return created(res, data, 'Perusahaan berhasil dibuat');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  update: async (req, res) => {
    try {
      const data = await svc.update(req.params.id, req.body);
      return success(res, data, 'Perusahaan berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  remove: async (req, res) => {
    try {
      await svc.remove(req.params.id);
      return success(res, null, 'Perusahaan berhasil dihapus');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
