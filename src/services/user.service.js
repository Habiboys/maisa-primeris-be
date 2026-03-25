'use strict';

const bcrypt       = require('bcryptjs');
const { Op }       = require('sequelize');
const { User, ActivityLog, Company } = require('../models');

const SALT_ROUNDS = 10;

// ── Helper: pagination ────────────────────────────────────────────
const paginate = (page = 1, limit = 20) => ({
  limit : Math.min(parseInt(limit, 10) || 20, 100),
  offset: ((parseInt(page, 10) || 1) - 1) * (Math.min(parseInt(limit, 10) || 20, 100)),
});

const isPlatformOwner = (actor) => actor?.role === 'Platform Owner';

const getTenantScope = (actor) => {
  if (isPlatformOwner(actor)) return {};
  if (!actor?.company_id) throw { message: 'User belum terikat perusahaan', status: 403 };
  return { company_id: actor.company_id };
};

const ensureCompanyExists = async (companyId) => {
  if (!companyId) return;
  const company = await Company.findByPk(companyId);
  if (!company) throw { message: 'Perusahaan tidak ditemukan', status: 404 };
};

module.exports = {
  // ── GET /users ────────────────────────────────────────────────
  list: async ({ search, role, status, page, limit } = {}, actor) => {
    const where = { ...getTenantScope(actor) };
    if (search) where[Op.or] = [
      { name:  { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
    if (role)   where.role   = role;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'code'] }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });

    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    return {
      data: rows,
      pagination: {
        page : parseInt(page, 10) || 1,
        limit: lim,
        total: count,
        total_pages: Math.ceil(count / lim),
      },
    };
  },

  // ── GET /users/:id ────────────────────────────────────────────
  getById: async (id, actor) => {
    const scope = getTenantScope(actor);
    const user = await User.findOne({
      where: { id, ...scope },
      attributes: { exclude: ['password'] },
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'code'] }],
    });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    return user;
  },

  // ── POST /users ───────────────────────────────────────────────
  create: async ({ name, email, password, role, phone, work_location_id, company_id }, actor) => {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw { message: 'Email sudah terdaftar', status: 409 };

    if (!isPlatformOwner(actor) && role === 'Platform Owner') {
      throw { message: 'Hanya Platform Owner yang dapat membuat role Platform Owner', status: 403 };
    }

    const assignedCompanyId = isPlatformOwner(actor)
      ? (company_id || null)
      : actor.company_id;

    if (role !== 'Platform Owner' && !assignedCompanyId) {
      throw { message: 'User non-platform wajib memiliki company', status: 400 };
    }

    await ensureCompanyExists(assignedCompanyId);

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone,
      work_location_id,
      company_id: assignedCompanyId,
    });
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── PUT /users/:id ────────────────────────────────────────────
  update: async (id, { name, email, role, phone, work_location_id, password, company_id }, actor) => {
    const user = await User.findOne({ where: { id, ...getTenantScope(actor) } });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) throw { message: 'Email sudah dipakai user lain', status: 409 };
    }

    if (!isPlatformOwner(actor) && role === 'Platform Owner') {
      throw { message: 'Hanya Platform Owner yang dapat mengubah ke role Platform Owner', status: 403 };
    }

    const assignedCompanyId = isPlatformOwner(actor)
      ? (typeof company_id !== 'undefined' ? company_id : user.company_id)
      : actor.company_id;

    if ((role ?? user.role) !== 'Platform Owner' && !assignedCompanyId) {
      throw { message: 'User non-platform wajib memiliki company', status: 400 };
    }

    await ensureCompanyExists(assignedCompanyId);

    const updates = {
      name,
      email,
      role,
      phone,
      work_location_id,
      company_id: assignedCompanyId,
    };
    if (password) updates.password = await bcrypt.hash(password, SALT_ROUNDS);

    await user.update(updates);
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── PATCH /users/:id/toggle-status ───────────────────────────
  toggleStatus: async (id, actor) => {
    const user = await User.findOne({ where: { id, ...getTenantScope(actor) } });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    await user.update({ status: newStatus });
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── DELETE /users/:id ─────────────────────────────────────────
  remove: async (id, actor) => {
    const user = await User.findOne({ where: { id, ...getTenantScope(actor) } });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    await user.destroy();
  },

  // ── GET /users/activity-logs ──────────────────────────────────
  listActivityLogs: async ({ user_id, date_from, date_to, page, limit } = {}, actor) => {
    const where = {};
    if (user_id)   where.user_id = user_id;
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to)   where.created_at[Op.lte] = new Date(`${date_to}T23:59:59`);
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role', 'company_id'],
        ...(isPlatformOwner(actor) ? {} : { where: { company_id: actor.company_id }, required: true }),
      }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });

    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    return {
      data: rows,
      pagination: {
        page : parseInt(page, 10) || 1,
        limit: lim,
        total: count,
        total_pages: Math.ceil(count / lim),
      },
    };
  },
};
