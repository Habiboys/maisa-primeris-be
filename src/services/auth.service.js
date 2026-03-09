'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User, ActivityLog } = require('../models');

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

module.exports = {
  // ── Login ──────────────────────────────────────────────────
  login: async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw { message: 'Email atau password salah', status: 401 };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw { message: 'Email atau password salah', status: 401 };

    if (user.status !== 'Aktif') throw { message: 'Akun Anda tidak aktif', status: 403 };

    const token = makeToken(user);
    await user.update({ last_login: new Date() });

    await ActivityLog.create({
      user_id : user.id,
      action  : 'LOGIN',
      entity  : 'users',
      entity_id: user.id,
      description: 'User login',
    }).catch(() => {}); // non-blocking

    return {
      token,
      user: {
        id             : user.id,
        name           : user.name,
        email          : user.email,
        role           : user.role,
        work_location_id: user.work_location_id,
      },
    };
  },

  // ── Logout ─────────────────────────────────────────────────
  logout: async (userId) => {
    await ActivityLog.create({
      user_id    : userId,
      action     : 'LOGOUT',
      entity     : 'users',
      entity_id  : userId,
      description: 'User logout',
    }).catch(() => {});
  },

  // ── Get Profile ────────────────────────────────────────────
  getProfile: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };
    return user;
  },

  // ── Change Password ────────────────────────────────────────
  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw { message: 'User tidak ditemukan', status: 404 };

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw { message: 'Password lama tidak sesuai', status: 400 };

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
  },
};
