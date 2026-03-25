'use strict';

const userService = require('../services/user.service');
const { success, created, error, notFound } = require('../utils/response');

module.exports = {
  // GET /users
  list: async (req, res) => {
    try {
      const result = await userService.list(req.query, req.user);
      return res.json({ success: true, ...result, message: 'Daftar user berhasil diambil' });
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // GET /users/activity-logs
  activityLogs: async (req, res) => {
    try {
      const result = await userService.listActivityLogs(req.query, req.user);
      return res.json({ success: true, ...result, message: 'Log aktivitas berhasil diambil' });
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // GET /users/:id
  getById: async (req, res) => {
    try {
      const data = await userService.getById(req.params.id, req.user);
      return success(res, data, 'Detail user berhasil diambil');
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // POST /users
  create: async (req, res) => {
    try {
      const data = await userService.create(req.body, req.user);
      return created(res, data, 'User berhasil ditambahkan');
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // PUT /users/:id
  update: async (req, res) => {
    try {
      const data = await userService.update(req.params.id, req.body, req.user);
      return success(res, data, 'User berhasil diperbarui');
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // PATCH /users/:id/toggle-status
  toggleStatus: async (req, res) => {
    try {
      const data = await userService.toggleStatus(req.params.id, req.user);
      return success(res, data, 'Status user berhasil diperbarui');
    } catch (err) { return error(res, err.message, err.status || 500); }
  },

  // DELETE /users/:id
  remove: async (req, res) => {
    try {
      await userService.remove(req.params.id, req.user);
      return success(res, null, 'User berhasil dihapus');
    } catch (err) { return error(res, err.message, err.status || 500); }
  },
};
