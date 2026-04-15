'use strict';

const Joi = require('joi');
const svc = require('../services/media.service');
const { success, created, error } = require('../utils/response');

const querySchema = Joi.object({
  search: Joi.string().allow('', null),
  category: Joi.string().max(80).allow('', null),
  page: Joi.number().integer().min(1).allow(null),
  limit: Joi.number().integer().min(1).max(100).allow(null),
});

module.exports = {
  list: async (req, res) => {
    const { error: vErr, value } = querySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, 'Validasi gagal', 400, vErr.details.map((d) => d.message));

    try {
      const result = await svc.list(value, req.user);
      return res.json({ success: true, ...result, message: 'Daftar media' });
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  upload: async (req, res) => {
    try {
      const row = await svc.upload({ file: req.file, category: req.body?.category }, req.user);
      return created(res, row, 'Media berhasil diupload');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  remove: async (req, res) => {
    try {
      await svc.remove(req.params.id, req.user);
      return success(res, null, 'Media berhasil dihapus');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
