"use strict";

const Joi = require("joi");
const svc = require("../services/qc.service");
const { success, created, error } = require("../utils/response");

const templateSchema = Joi.object({
  name: Joi.string().max(150).required(),
  description: Joi.string().allow(null, ""),
  is_active: Joi.boolean(),
  sections: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        order_index: Joi.number().integer().min(0),
        items: Joi.array().items(
          Joi.object({
            description: Joi.string().required(),
            order_index: Joi.number().integer().min(0),
          })
        ),
      })
    )
    .optional(),
});

const sectionSchema = Joi.object({
  name: Joi.string().max(150).required(),
  order_index: Joi.number().integer().min(0),
});

const itemSchema = Joi.object({
  description: Joi.string().required(),
  order_index: Joi.number().integer().min(0),
});

const resultSchema = Joi.object({
  item_id: Joi.string().uuid().allow(null, ""),
  template_item_id: Joi.string().uuid().allow(null, ""),
  result: Joi.string().valid("OK", "Not OK", "N/A", "NOT OK").optional(),
  status: Joi.string().valid("OK", "Not OK", "N/A", "NOT OK").optional(),
  notes: Joi.string().allow(null, ""),
  remarks: Joi.string().allow(null, ""),
  photo_url: Joi.string().allow(null, ""),
  photo: Joi.string().allow(null, ""),
});

const submissionSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  unit_id: Joi.string().uuid().allow(null, ""),
  unit_no: Joi.string().max(50).allow(null, ""),
  template_id: Joi.string().uuid().required(),
  submission_date: Joi.date().iso().required(),
  notes: Joi.string().allow(null, ""),
  status: Joi.string().valid("Draft", "Submitted", "Approved", "Rejected"),
  results: Joi.array().items(resultSchema),
});

const submissionUpdateSchema = submissionSchema.fork(
  ["project_id", "template_id", "submission_date"],
  (s) => s.optional()
);

module.exports = {
  // ── Templates ───────────────────────────────────────────
  listTemplates: async (_req, res) => {
    try {
      const r = await svc.listTemplates();
      return success(res, r, "Daftar template QC");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getTemplate: async (req, res) => {
    try {
      const r = await svc.getTemplate(req.params.id);
      return success(res, r, "Detail template QC");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  createTemplate: async (req, res) => {
    const { error: vErr } = templateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createTemplate(req.body);
      return created(res, r, "Template QC berhasil dibuat");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateTemplate: async (req, res) => {
    const { error: vErr } = templateSchema.fork(["name"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateTemplate(req.params.id, req.body);
      return success(res, r, "Template QC diperbarui");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  removeTemplate: async (req, res) => {
    try {
      await svc.removeTemplate(req.params.id);
      return success(res, null, "Template QC dihapus");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  duplicateTemplate: async (req, res) => {
    try {
      const r = await svc.duplicateTemplate(req.params.id);
      return created(res, r, "Template QC diduplikasi");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // ── Sections ────────────────────────────────────────────
  createSection: async (req, res) => {
    const { error: vErr } = sectionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createSection(req.params.id, req.body);
      return created(res, r, "Section ditambahkan");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateSection: async (req, res) => {
    const { error: vErr } = sectionSchema.fork(["name"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateSection(req.params.id, req.params.sectionId, req.body);
      return success(res, r, "Section diperbarui");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  removeSection: async (req, res) => {
    try {
      await svc.removeSection(req.params.id, req.params.sectionId);
      return success(res, null, "Section dihapus");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // ── Items ───────────────────────────────────────────────
  createItem: async (req, res) => {
    const { error: vErr } = itemSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createItem(req.params.id, req.params.sectionId, req.body);
      return created(res, r, "Item QC ditambahkan");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateItem: async (req, res) => {
    const { error: vErr } = itemSchema.fork(["description"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateItem(req.params.id, req.params.sectionId, req.params.itemId, req.body);
      return success(res, r, "Item QC diperbarui");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  removeItem: async (req, res) => {
    try {
      await svc.removeItem(req.params.id, req.params.sectionId, req.params.itemId);
      return success(res, null, "Item QC dihapus");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // ── Submissions ─────────────────────────────────────────
  listSubmissions: async (req, res) => {
    try {
      const r = await svc.listSubmissions(req.query);
      return success(res, r, "Daftar submission QC");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  getSubmission: async (req, res) => {
    try {
      const r = await svc.getSubmission(req.params.id);
      return success(res, r, "Detail submission QC");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  createSubmission: async (req, res) => {
    const { error: vErr } = submissionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createSubmission(req.body, req.user.id);
      return created(res, r, "Submission QC dibuat");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  updateSubmission: async (req, res) => {
    const { error: vErr } = submissionUpdateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateSubmission(req.params.id, req.body);
      return success(res, r, "Submission QC diperbarui");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  submitSubmission: async (req, res) => {
    try {
      const r = await svc.submitSubmission(req.params.id, req.user.id);
      return success(res, r, "Submission QC disubmit");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  removeSubmission: async (req, res) => {
    try {
      await svc.removeSubmission(req.params.id);
      return success(res, null, "Submission QC dihapus");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  exportSubmission: async (req, res) => {
    try {
      const r = await svc.exportSubmission(req.params.id);
      return success(res, r, "Export submission QC");
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },
};
