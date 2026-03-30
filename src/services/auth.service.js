'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, ActivityLog, Company, CompanySetting } = require('../models');
const { sendPasswordResetEmail } = require('../utils/mailer');

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

const RESET_EXPIRY_HOURS = 1;

module.exports = {
  // ── Login ──────────────────────────────────────────────────
  login: async (email, password) => {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'code', 'is_active'],
        include: [{ model: CompanySetting, as: 'settings' }],
      }],
    });
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
        company_id     : user.company_id,
        company        : user.company || null,
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
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'code', 'is_active'],
        include: [{ model: CompanySetting, as: 'settings' }],
      }],
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

  // ── Forgot Password: kirim link reset ke email ──────────────
  requestPasswordReset: async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Jangan bocorkan apakah email terdaftar
      return;
    }
    if (user.status !== 'Aktif') return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: expires,
    });

    await sendPasswordResetEmail(user.email, resetToken);
  },

  // ── Verifikasi token reset (untuk validasi di frontend) ─────
  verifyResetToken: async (token) => {
    if (!token) throw { message: 'Token tidak valid', status: 400 };
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() },
      },
    });
    if (!user) throw { message: 'Token tidak valid atau sudah kadaluarsa', status: 400 };
    return { valid: true, email: user.email };
  },

  // ── Reset password dengan token dari email ─────────────────
  resetPassword: async (token, newPassword) => {
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() },
      },
    });
    if (!user) throw { message: 'Token tidak valid atau sudah kadaluarsa', status: 400 };

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashed,
      password_reset_token: null,
      password_reset_expires: null,
    });
  },
};
