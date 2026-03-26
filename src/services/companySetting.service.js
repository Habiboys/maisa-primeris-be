'use strict';

const { Company, CompanySetting } = require('../models');

const defaultColors = {
  primary_color: '#2563eb',
  secondary_color: '#14b8a6',
  accent_color: '#f59e0b',
};

const ensureSettingByCompany = async (companyId) => {
  const company = await Company.findByPk(companyId);
  if (!company) throw { message: 'Perusahaan tidak ditemukan', status: 404 };

  let setting = await CompanySetting.findOne({ where: { company_id: companyId } });
  if (!setting) {
    setting = await CompanySetting.create({
      company_id: companyId,
      app_name: company.name,
      ...defaultColors,
    });
  }

  return setting;
};

const updateByCompanyId = async (companyId, payload = {}, logoPath = null) => {
  const setting = await ensureSettingByCompany(companyId);
  const next = {
    app_name: payload.app_name ?? setting.app_name,
    logo_url: logoPath || (payload.logo_url ?? setting.logo_url),
    favicon_url: payload.favicon_url ?? setting.favicon_url,
    primary_color: payload.primary_color ?? setting.primary_color,
    secondary_color: payload.secondary_color ?? setting.secondary_color,
    accent_color: payload.accent_color ?? setting.accent_color,
  };

  await setting.update(next);
  return setting;
};

// Update untuk sekaligus menyimpan upload logo + favicon
const updateByCompanyIdWithFiles = async (companyId, payload = {}, logoPath = null, faviconPath = null) => {
  const setting = await ensureSettingByCompany(companyId);
  const next = {
    app_name: payload.app_name ?? setting.app_name,
    logo_url: logoPath || (payload.logo_url ?? setting.logo_url),
    favicon_url: faviconPath || (payload.favicon_url ?? setting.favicon_url),
    primary_color: payload.primary_color ?? setting.primary_color,
    secondary_color: payload.secondary_color ?? setting.secondary_color,
    accent_color: payload.accent_color ?? setting.accent_color,
  };
  await setting.update(next);
  return setting;
};

module.exports = {
  getByCompanyId: async (companyId) => ensureSettingByCompany(companyId),

  getForCurrentUser: async (user) => {
    if (user.role === 'Platform Owner' && !user.company_id) {
      throw { message: 'Platform Owner tidak terikat company. Gunakan endpoint setting per company.', status: 400 };
    }

    if (!user.company_id) throw { message: 'User belum terikat perusahaan', status: 400 };

    return ensureSettingByCompany(user.company_id);
  },

  updateByCompanyId: async (companyId, payload = {}, logoPath = null) => updateByCompanyId(companyId, payload, logoPath),

  updateByCompanyIdWithFiles: async (companyId, payload = {}, logoPath = null, faviconPath = null) =>
    updateByCompanyIdWithFiles(companyId, payload, logoPath, faviconPath),

  updateForCurrentUser: async (user, payload = {}, logoPath = null) => {
    if (!user.company_id) throw { message: 'User belum terikat perusahaan', status: 400 };
    return updateByCompanyId(user.company_id, payload, logoPath);
  },
};
