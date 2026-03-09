'use strict';

const bcrypt       = require('bcryptjs');
const { Op }       = require('sequelize');
const { User, ActivityLog } = require('../models');

const SALT_ROUNDS = 10;

// ── Helper: pagination ────────────────────────────────────────────
const paginate = (page = 1, limit = 20) => ({
  limit : Math.min(parseInt(limit, 10) || 20, 100),
  offset: ((parseInt(page, 10) || 1) - 1) * (Math.min(parseInt(limit, 10) || 20, 100)),
});

module.exports = {
  // ── GET /users ────────────────────────────────────────────────
  list: async ({ search, role, status, page, limit } = {}) => {
    const where = {};
    if (search) where[Op.or] = [
      { name:  { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
    if (role)   where.role   = role;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
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
  getById: async (id) => {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    return user;
  },

  // ── POST /users ───────────────────────────────────────────────
  create: async ({ name, email, password, role, phone, work_location_id }) => {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw { message: 'Email sudah terdaftar', status: 409 };

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name, email, password: hashed, role, phone, work_location_id,
    });
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── PUT /users/:id ────────────────────────────────────────────
  update: async (id, { name, email, role, phone, work_location_id, password }) => {
    const user = await User.findByPk(id);
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) throw { message: 'Email sudah dipakai user lain', status: 409 };
    }

    const updates = { name, email, role, phone, work_location_id };
    if (password) updates.password = await bcrypt.hash(password, SALT_ROUNDS);

    await user.update(updates);
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── PATCH /users/:id/toggle-status ───────────────────────────
  toggleStatus: async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    await user.update({ status: newStatus });
    const { password: _, ...safe } = user.toJSON();
    return safe;
  },

  // ── DELETE /users/:id ─────────────────────────────────────────
  remove: async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    await user.destroy();
  },

  // ── GET /users/activity-logs ──────────────────────────────────
  listActivityLogs: async ({ user_id, date_from, date_to, page, limit } = {}) => {
    const where = {};
    if (user_id)   where.user_id = user_id;
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to)   where.created_at[Op.lte] = new Date(`${date_to}T23:59:59`);
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
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
