'use strict';

const svc = require('../services/companySetting.service');
const { success, error } = require('../utils/response');

module.exports = {
  me: async (req, res) => {
    try {
      const data = await svc.getForCurrentUser(req.user);
      return success(res, data, 'Setting branding company berhasil diambil');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateMe: async (req, res) => {
    try {
      const logoPath = req.file ? `/uploads/company-branding/${req.file.filename}` : null;
      const data = await svc.updateForCurrentUser(req.user, req.body, logoPath);
      return success(res, data, 'Setting branding company berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getByCompanyId: async (req, res) => {
    try {
      const data = await svc.getByCompanyId(req.params.companyId);
      return success(res, data, 'Setting branding perusahaan berhasil diambil');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateByCompanyId: async (req, res) => {
    try {
      const logoPath = req.file ? `/uploads/company-branding/${req.file.filename}` : null;
      const data = await svc.updateByCompanyId(req.params.companyId, req.body, logoPath);
      return success(res, data, 'Setting branding perusahaan berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
