'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const {
  sequelize,
  Company,
  CompanySetting,
  User,
  UnitStatus,
  ConstructionStatus,
  WorkLocation,
  AttendanceSetting,
} = require('../models');

// Kosongkan atau isi hanya status yang benar-benar perlu
const DEFAULT_CONSTRUCTION_STATUSES = [];

const slugify = (text = '') =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);

const getCompanyById = async (id) => {
  const company = await Company.findByPk(id, {
    include: [{ model: CompanySetting, as: 'settings' }],
  });

  if (!company) throw { message: 'Perusahaan tidak ditemukan', status: 404 };
  return company;
};

const makeTenantAdminEmail = (companyCode) => `admin+${companyCode}@primeris.one`;

const makeTempPassword = () => {
  const part = Math.random().toString(36).slice(2, 8);
  return `Tenant@${part}9`;
};

const buildDefaultUnitStatuses = (companyId) => {
  const statuses = [];

  for (let i = 0; i < 40; i += 1) {
    const block = i < 20 ? 'A' : 'B';
    const num = String((i % 20) + 1).padStart(2, '0');
    statuses.push({
      company_id: companyId,
      unit_code: `${block}-${num}`,
      project_id: null,
      status: 'Tersedia',
      consumer_id: null,
      price: 750000000,
      notes: null,
    });
  }

  return statuses;
};

module.exports = {
  list: async ({ search, is_active } = {}) => {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { domain: { [Op.like]: `%${search}%` } },
      ];
    }

    if (typeof is_active !== 'undefined') {
      where.is_active = String(is_active) === 'true';
    }

    return Company.findAll({
      where,
      include: [{ model: CompanySetting, as: 'settings' }],
      order: [['created_at', 'DESC']],
    });
  },

  getById: async (id) => getCompanyById(id),

  create: async ({
    name,
    code,
    domain,
    is_active,
    subscription_plan,
    billing_cycle,
    subscription_status,
    subscription_started_at,
    subscription_ended_at,
    is_suspended,
    admin_name,
    admin_email,
    admin_password,
  }) => {
    try {
      if (!name) throw { message: 'Nama perusahaan wajib diisi', status: 400 };

      const companyCode = code || slugify(name);
      if (!companyCode) throw { message: 'Kode perusahaan tidak valid', status: 400 };

      const existing = await Company.findOne({ where: { code: companyCode } });
      if (existing) throw { message: 'Kode perusahaan sudah digunakan', status: 409 };

      if (domain) {
        const existingDomain = await Company.findOne({ where: { domain } });
        if (existingDomain) throw { message: 'Domain perusahaan sudah digunakan', status: 409 };
      }

      const tenantAdminEmail = admin_email || makeTenantAdminEmail(companyCode);
      const tenantAdminPassword = admin_password || makeTempPassword();

      const existingAdminEmail = await User.findOne({ where: { email: tenantAdminEmail } });
      if (existingAdminEmail) {
        throw { message: 'Email admin tenant sudah digunakan', status: 409 };
      }

      const created = await sequelize.transaction(async (transaction) => {
        const company = await Company.create({
          name,
          code: companyCode,
          domain: domain || null,
          is_active: typeof is_active === 'boolean' ? is_active : true,
          subscription_plan: subscription_plan || 'basic',
          billing_cycle: billing_cycle || 'monthly',
          subscription_status: subscription_status || 'active',
          subscription_started_at: subscription_started_at || new Date(),
          subscription_ended_at: subscription_ended_at || null,
          is_suspended: typeof is_suspended === 'boolean' ? is_suspended : false,
        }, { transaction });

        await CompanySetting.create({
          company_id: company.id,
          app_name: name,
        }, { transaction });

        await AttendanceSetting.create({
          company_id: company.id,
          work_start_time: '08:00:00',
          work_end_time: '17:00:00',
          late_grace_minutes: 0,
        }, { transaction });

        await WorkLocation.create({
          company_id: company.id,
          name: `Kantor Pusat ${name}`,
          address: '-',
          latitude: null,
          longitude: null,
          radius_m: 100,
          is_active: true,
        }, { transaction });

        await UnitStatus.bulkCreate(buildDefaultUnitStatuses(company.id), { transaction });

        const constructionPayload = DEFAULT_CONSTRUCTION_STATUSES.map((item) => ({
          company_id: company.id,
          name: item.name,
          progress: item.progress,
          color: item.color,
          order_index: item.order_index,
        }));
        await ConstructionStatus.bulkCreate(constructionPayload, { transaction });

        // Tidak lagi auto-create admin tenant. Admin tenant dibuat manual via UI.
        return {
          companyId: company.id,
          provisioning: {},
        };
      });

      const data = await getCompanyById(created.companyId);
      return {
        ...data.toJSON(),
        provisioning: created.provisioning,
      };
    } catch (err) {
      // Log error detail ke console
      // eslint-disable-next-line no-console
      console.error('Error provisioning tenant:', err);
      // Kirim error detail ke response jika dari Sequelize
      if (err && err.errors && Array.isArray(err.errors)) {
        const messages = err.errors.map(e => e.message).join('; ');
        throw { message: `Validation error: ${messages}`, status: 400 };
      }
      throw err;
    }
  },

  update: async (id, {
    name,
    code,
    domain,
    is_active,
    subscription_plan,
    billing_cycle,
    subscription_status,
    subscription_started_at,
    subscription_ended_at,
    is_suspended,
  }) => {
    const company = await Company.findByPk(id);
    if (!company) throw { message: 'Perusahaan tidak ditemukan', status: 404 };

    if (code && code !== company.code) {
      const existsCode = await Company.findOne({ where: { code } });
      if (existsCode) throw { message: 'Kode perusahaan sudah digunakan', status: 409 };
    }

    if (typeof domain !== 'undefined' && domain !== company.domain) {
      if (domain) {
        const existsDomain = await Company.findOne({ where: { domain } });
        if (existsDomain) throw { message: 'Domain perusahaan sudah digunakan', status: 409 };
      }
    }

    await company.update({
      name: name ?? company.name,
      code: code ?? company.code,
      domain: typeof domain === 'undefined' ? company.domain : domain,
      is_active: typeof is_active === 'boolean' ? is_active : company.is_active,
      subscription_plan: subscription_plan ?? company.subscription_plan,
      billing_cycle: billing_cycle ?? company.billing_cycle,
      subscription_status: subscription_status ?? company.subscription_status,
      subscription_started_at: typeof subscription_started_at === 'undefined'
        ? company.subscription_started_at
        : subscription_started_at,
      subscription_ended_at: typeof subscription_ended_at === 'undefined'
        ? company.subscription_ended_at
        : subscription_ended_at,
      is_suspended: typeof is_suspended === 'boolean' ? is_suspended : company.is_suspended,
    });

    return getCompanyById(id);
  },

  remove: async (id) => {
    const company = await Company.findByPk(id);
    if (!company) throw { message: 'Perusahaan tidak ditemukan', status: 404 };

    await company.destroy();
  },
};
