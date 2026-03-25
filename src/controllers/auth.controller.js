'use strict';

const authService = require('../services/auth.service');
const { success, error, badRequest } = require('../utils/response');

module.exports = {
  // POST /api/v1/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return success(res, result, 'Login berhasil');
    } catch (err) {
      return error(res, err.message, err.status || 401);
    }
  },

  // POST /api/v1/auth/logout
  logout: async (req, res) => {
    try {
      await authService.logout(req.user.id);
      return success(res, null, 'Logout berhasil');
    } catch (err) {
      return error(res, err.message, err.status || 500);
    }
  },

  // GET /api/v1/auth/me
  me: async (req, res) => {
    try {
      const user = await authService.getProfile(req.user.id);
      return success(res, user, 'Profil berhasil diambil');
    } catch (err) {
      return error(res, err.message, err.status || 500);
    }
  },

  // PUT /api/v1/auth/change-password
  changePassword: async (req, res) => {
    try {
      const { old_password, new_password } = req.body;
      await authService.changePassword(req.user.id, old_password, new_password);
      return success(res, null, 'Password berhasil diubah');
    } catch (err) {
      return error(res, err.message, err.status || 400);
    }
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      return success(res, null, 'Jika email terdaftar, Anda akan menerima link reset password.');
    } catch (err) {
      return error(res, err.message, err.status || 500);
    }
  },

  // GET /api/v1/auth/verify-reset-token?token=xxx
  verifyResetToken: async (req, res) => {
    try {
      const { token } = req.query;
      const result = await authService.verifyResetToken(token);
      return success(res, result, 'Token valid');
    } catch (err) {
      return error(res, err.message, err.status || 400);
    }
  },

  // POST /api/v1/auth/reset-password
  resetPassword: async (req, res) => {
    try {
      const { token, new_password } = req.body;
      await authService.resetPassword(token, new_password);
      return success(res, null, 'Password berhasil direset. Silakan login dengan password baru.');
    } catch (err) {
      return error(res, err.message, err.status || 400);
    }
  },
};
