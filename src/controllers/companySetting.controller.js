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
      const logoFile = req.files?.logo?.[0];
      const faviconFile = req.files?.favicon?.[0];
      const logoPath = logoFile ? `/uploads/company-branding/${logoFile.filename}` : null;
      const faviconPath = faviconFile ? `/uploads/company-branding/${faviconFile.filename}` : null;

      // Validasi tenant context seperti implementasi lama
      if (req.user.role === 'Platform Owner' && !req.user.company_id) {
        throw { message: 'Platform Owner tidak terikat company. Gunakan endpoint setting per company.', status: 400 };
      }
      if (!req.user.company_id) {
        throw { message: 'User belum terikat perusahaan', status: 400 };
      }

      const data = await svc.updateByCompanyIdWithFiles(req.user.company_id, req.body, logoPath, faviconPath);
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
      const logoFile = req.files?.logo?.[0];
      const faviconFile = req.files?.favicon?.[0];
      const logoPath = logoFile ? `/uploads/company-branding/${logoFile.filename}` : null;
      const faviconPath = faviconFile ? `/uploads/company-branding/${faviconFile.filename}` : null;

      const data = await svc.updateByCompanyIdWithFiles(req.params.companyId, req.body, logoPath, faviconPath);
      return success(res, data, 'Setting branding perusahaan berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
