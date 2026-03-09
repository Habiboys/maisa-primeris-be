"use strict";

const Joi = require("joi");
const svc = require("../services/project.service");
const { success, created, error } = require("../utils/response");

// Joi schemas
const projectSchema = Joi.object({
  name: Joi.string().max(150).required(),
  type: Joi.string().valid("cluster", "standalone").required(),
  location: Joi.string().max(255).allow(null, ""),
  units_count: Joi.number().integer().min(0),
  progress: Joi.number().integer().min(0).max(100),
  status: Joi.string().valid("On Progress", "Completed", "Delayed"),
  deadline: Joi.string().max(50).allow(null, ""),
  lead: Joi.string().max(100).allow(null, ""),
  qc_template_id: Joi.string().uuid().allow(null, ""),
  construction_status: Joi.string().max(100).allow(null, ""),
  start_date: Joi.date().iso().allow(null, ""),
  end_date: Joi.date().iso().allow(null, ""),
  description: Joi.string().allow(null, ""),
});

const unitSchema = Joi.object({
  no: Joi.string().max(50).required(),
  tipe: Joi.string().max(50).allow(null, ""),
  progress: Joi.number().integer().min(0).max(100),
  status: Joi.string().max(100).allow(null, ""),
  qc_status: Joi.string().valid("Pass", "Fail", "Ongoing"),
  qc_readiness: Joi.number().integer().min(0).max(100),
  construction_status_id: Joi.string().uuid().allow(null, ""),
  qc_template_id: Joi.string().uuid().allow(null, ""),
  notes: Joi.string().allow(null, ""),
});

const constructionStatusSchema = Joi.object({
  name: Joi.string().max(100).required(),
  progress: Joi.number().integer().min(0).max(100).required(),
  color: Joi.string().max(100).allow(null, ""),
  order_index: Joi.number().integer().min(0).required(),
});

const timeScheduleSchema = Joi.object({
  week_label: Joi.string().max(50).allow(null, ""),
  activity: Joi.string().max(255).required(),
  plan_start: Joi.date().iso().allow(null, ""),
  plan_end: Joi.date().iso().allow(null, ""),
  actual_start: Joi.date().iso().allow(null, ""),
  actual_end: Joi.date().iso().allow(null, ""),
  progress: Joi.number().precision(2).min(0).max(100).allow(null),
  bobot: Joi.number().precision(2).min(0).max(100).allow(null),
  bulan1: Joi.any(),
  bulan2: Joi.any(),
  bulan3: Joi.any(),
  bulan4: Joi.any(),
});

const inventorySchema = Joi.object({
  unit_no: Joi.string().max(20).allow(null, ""),
  date: Joi.date().iso().required(),
  item: Joi.string().max(200).required(),
  qty: Joi.number().precision(2).required(),
  unit_satuan: Joi.string().max(30).allow(null, ""),
  person: Joi.string().max(100).allow(null, ""),
  type: Joi.string().valid("in", "out").required(),
  notes: Joi.string().allow(null, ""),
});

const workLogSchema = Joi.object({
  unit_no: Joi.string().max(20).allow(null, ""),
  date: Joi.date().iso().required(),
  activity: Joi.string().required(),
  worker_count: Joi.number().integer().min(0).allow(null),
  progress_added: Joi.number().precision(2).min(0).max(100).allow(null),
  status: Joi.string().valid("Normal", "Lembur", "Kendala").allow(null),
  weather: Joi.string().max(50).allow(null, ""),
});

module.exports = {
  // Projects
  listProjects: async (req, res) => {
    try {
      const r = await svc.listProjects(req.query);
      return res.json({ success: true, ...r, message: "Daftar proyek" });
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  getProject: async (req, res) => {
    try {
      const r = await svc.getProjectById(req.params.id);
      return success(res, r, "Detail proyek");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  createProject: async (req, res) => {
    const { error: vErr } = projectSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createProject(req.body);
      return created(res, r, "Proyek berhasil dibuat");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  updateProject: async (req, res) => {
    const { error: vErr } = projectSchema.fork(["name", "type"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateProject(req.params.id, req.body);
      return success(res, r, "Proyek berhasil diperbarui");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  removeProject: async (req, res) => {
    try {
      await svc.removeProject(req.params.id);
      return success(res, null, "Proyek berhasil dihapus");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  // Units
  listUnits: async (req, res) => {
    try {
      const r = await svc.listUnits(req.params.projectId);
      return success(res, r, "Daftar unit");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  getUnit: async (req, res) => {
    try {
      const r = await svc.getUnit(req.params.projectId, req.params.unitNo);
      return success(res, r, "Detail unit");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  createUnit: async (req, res) => {
    const { error: vErr } = unitSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createUnit(req.params.projectId, req.body);
      return created(res, r, "Unit berhasil ditambahkan");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  updateUnit: async (req, res) => {
    const { error: vErr } = unitSchema.fork(["no"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateUnit(req.params.projectId, req.params.unitNo, req.body);
      return success(res, r, "Unit berhasil diperbarui");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  removeUnit: async (req, res) => {
    try {
      await svc.removeUnit(req.params.projectId, req.params.unitNo);
      return success(res, null, "Unit berhasil dihapus");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  // Construction statuses
  listConstructionStatuses: async (_req, res) => {
    try { const r = await svc.listConstructionStatuses(); return success(res, r, "Daftar status konstruksi"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  createConstructionStatus: async (req, res) => {
    const { error: vErr } = constructionStatusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try { const r = await svc.createConstructionStatus(req.body); return created(res, r, "Status konstruksi ditambahkan"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  updateConstructionStatus: async (req, res) => {
    const { error: vErr } = constructionStatusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try { const r = await svc.updateConstructionStatus(req.params.id, req.body); return success(res, r, "Status konstruksi diperbarui"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  removeConstructionStatus: async (req, res) => {
    try { await svc.removeConstructionStatus(req.params.id); return success(res, null, "Status konstruksi dihapus"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  // Time schedule
  listTimeSchedule: async (req, res) => {
    try {
      const r = await svc.listTimeSchedule(req.params.projectId, req.params.unitNo);
      return success(res, r, "Daftar time schedule");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  createTimeScheduleItem: async (req, res) => {
    const { error: vErr } = timeScheduleSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createTimeScheduleItem(req.params.projectId, req.params.unitNo, req.body);
      return created(res, r, "Item time schedule ditambahkan");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  updateTimeScheduleItem: async (req, res) => {
    const { error: vErr } = timeScheduleSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateTimeScheduleItem(req.params.projectId, req.params.unitNo, req.params.itemId, req.body);
      return success(res, r, "Item time schedule diperbarui");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  // Inventory
  listInventoryLogs: async (req, res) => {
    try { const r = await svc.listInventoryLogs(req.params.projectId); return success(res, r, "Daftar inventory log"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  createInventoryLog: async (req, res) => {
    const { error: vErr } = inventorySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createInventoryLog(req.params.projectId, req.body, req.user.id);
      return created(res, r, "Inventory log ditambahkan");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  // Work logs
  listWorkLogs: async (req, res) => {
    try { const r = await svc.listWorkLogs(req.params.projectId, req.query); return success(res, r, "Daftar work log"); }
    catch (e) { return error(res, e.message, e.status || 500); }
  },

  createWorkLog: async (req, res) => {
    const { error: vErr } = workLogSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.createWorkLog(req.params.projectId, req.body, req.files, req.user.id);
      return created(res, r, "Work log ditambahkan");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },

  updateWorkLog: async (req, res) => {
    const { error: vErr } = workLogSchema.fork(["date", "activity"], (s) => s.optional()).validate(req.body, { abortEarly: false, stripUnknown: true });
    if (vErr) return error(res, "Validasi gagal", 400, vErr.details.map((d) => d.message));
    try {
      const r = await svc.updateWorkLog(req.params.projectId, req.params.logId, req.body);
      return success(res, r, "Work log diperbarui");
    } catch (e) { return error(res, e.message, e.status || 500); }
  },
};
