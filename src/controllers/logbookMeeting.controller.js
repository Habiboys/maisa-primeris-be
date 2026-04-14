'use strict';

const Joi = require('joi');
const svc = require('../services/logbookMeeting.service');
const { success, created, error } = require('../utils/response');

const logbookCreateSchema = Joi.object({
  date: Joi.date().iso().required(),
  job_category_id: Joi.string().uuid().required(),
  description: Joi.string().required(),
  progress: Joi.number().integer().min(0).max(100).allow(null),
  status: Joi.string().valid('Draft', 'Submitted', 'Reviewed').allow(null, ''),
});

const logbookUpdateSchema = Joi.object({
  date: Joi.date().iso(),
  job_category_id: Joi.string().uuid(),
  description: Joi.string(),
  progress: Joi.number().integer().min(0).max(100).allow(null),
  status: Joi.string().valid('Draft', 'Submitted', 'Reviewed'),
});

const meetingActionSchema = Joi.object({
  task: Joi.string().required(),
  assigned_to: Joi.string().uuid().allow(null, ''),
  deadline: Joi.date().iso().allow(null, ''),
});

const meetingCreateSchema = Joi.object({
  title: Joi.string().max(200).required(),
  date: Joi.date().iso().required(),
  meeting_type: Joi.string().valid('Mingguan', 'Bulanan').required(),
  participants: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string().trim().max(150)).max(100),
  ).optional(),
  discussion: Joi.string().required(),
  result: Joi.string().required(),
  actions: Joi.array().items(meetingActionSchema).max(200).optional(),
});

const meetingUpdateSchema = Joi.object({
  title: Joi.string().max(200),
  date: Joi.date().iso(),
  meeting_type: Joi.string().valid('Mingguan', 'Bulanan'),
  participants: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string().trim().max(150)).max(100),
  ),
  discussion: Joi.string(),
  result: Joi.string(),
  actions: Joi.array().items(meetingActionSchema).max(200),
});

module.exports = {
  // ── Job Categories ────────────────────────────────────────
  listJobCategories: async (req, res) => {
    try {
      const r = await svc.listJobCategories(req.user);
      return success(res, r, 'Daftar kategori pekerjaan');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // ── Logbooks ───────────────────────────────────────────────
  listLogbooks: async (req, res) => {
    try {
      const r = await svc.listLogbooks(req.query, req.user);
      return res.json({ success: true, ...r, message: 'Daftar logbook' });
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getLogbook: async (req, res) => {
    try {
      const r = await svc.getLogbookById(req.params.id, req.user);
      return success(res, r, 'Detail logbook');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  createLogbook: async (req, res) => {
    const { error: vErr } = logbookCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, 'Validasi gagal', 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createLogbook(req.body, req.files, req.user);
      return created(res, r, 'Logbook ditambahkan');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateLogbook: async (req, res) => {
    const { error: vErr } = logbookUpdateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, 'Validasi gagal', 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateLogbook(req.params.id, req.body, req.user);
      return success(res, r, 'Logbook diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  deleteLogbook: async (req, res) => {
    try {
      await svc.deleteLogbook(req.params.id, req.user);
      return success(res, null, 'Logbook dihapus');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  addLogbookFiles: async (req, res) => {
    try {
      const r = await svc.addLogbookFiles(req.params.id, req.files, req.user);
      return created(res, r, 'File logbook ditambahkan');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  deleteLogbookFile: async (req, res) => {
    try {
      await svc.deleteLogbookFile(req.params.id, req.params.fileId, req.user);
      return success(res, null, 'File logbook dihapus');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // ── Meeting Notes ──────────────────────────────────────────
  listMeetingNotes: async (req, res) => {
    try {
      const r = await svc.listMeetingNotes(req.query, req.user);
      return res.json({ success: true, ...r, message: 'Daftar notulensi' });
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getMeetingNote: async (req, res) => {
    try {
      const r = await svc.getMeetingNoteById(req.params.id, req.user);
      return success(res, r, 'Detail notulensi');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  createMeetingNote: async (req, res) => {
    const { error: vErr } = meetingCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, 'Validasi gagal', 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createMeetingNote(req.body, req.user);
      return created(res, r, 'Notulensi ditambahkan');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateMeetingNote: async (req, res) => {
    const { error: vErr } = meetingUpdateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, 'Validasi gagal', 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateMeetingNote(req.params.id, req.body, req.user);
      return success(res, r, 'Notulensi diperbarui');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  deleteMeetingNote: async (req, res) => {
    try {
      await svc.deleteMeetingNote(req.params.id, req.user);
      return success(res, null, 'Notulensi dihapus');
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  exportMeetingNotePdf: async (req, res) => {
    try {
      const pdfBuffer = await svc.exportMeetingNotePdf(req.params.id, req.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=notulensi-${req.params.id}.pdf`);
      return res.status(200).send(pdfBuffer);
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
