"use strict";

const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const {
  Project,
  ProjectUnit,
  ConstructionStatus,
  TimeScheduleItem,
  InventoryLog,
  WorkLog,
  WorkLogPhoto,
} = require("../models");

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};

const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Recalculate and persist project.progress:
 * - cluster   : average of all unit progress values
 * - standalone: progress from the matching ConstructionStatus row
 */
const recalculateProjectProgress = async (projectId) => {
  const project = await Project.findByPk(projectId);
  if (!project) return;

  let newProgress = project.progress ?? 0;

  if (project.type === 'cluster') {
    const units = await ProjectUnit.findAll({ where: { project_id: projectId } });
    if (units.length > 0) {
      const total = units.reduce((sum, u) => sum + (u.progress ?? 0), 0);
      newProgress = Math.round(total / units.length);
    } else {
      newProgress = 0;
    }
  } else {
    // standalone — derive from construction_status name
    if (project.construction_status) {
      const cs = await ConstructionStatus.findOne({ where: { name: project.construction_status } });
      if (cs) newProgress = cs.progress ?? 0;
    }
  }

  await project.update({ progress: newProgress });
};

module.exports = {
  // ── Projects ──────────────────────────────────────────────
  listProjects: async ({ search, type, status, page, limit } = {}) => {
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: ProjectUnit, as: "units" }],
      order: [["created_at", "DESC"]],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getProjectById: async (id) => {
    const p = await Project.findByPk(id, { include: [{ model: ProjectUnit, as: "units" }] });
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    return p;
  },

  createProject: (payload) => Project.create(payload),

  updateProject: async (id, payload) => {
    const p = await Project.findByPk(id);
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    await p.update(payload);
    // If construction_status changed on a standalone project, sync progress
    if (payload.construction_status !== undefined && p.type === 'standalone') {
      await recalculateProjectProgress(id);
    }
    return p;
  },

  removeProject: async (id) => {
    const p = await Project.findByPk(id);
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    await p.destroy();
  },

  // ── Project Units ──────────────────────────────────────────
  listUnits: async (projectId) => {
    return ProjectUnit.findAll({ where: { project_id: projectId }, order: [["created_at", "DESC"]] });
  },

  getUnit: async (projectId, unitNo) => {
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    return u;
  },

  createUnit: async (projectId, payload) => {
    const unit = await ProjectUnit.create({ ...payload, project_id: projectId });
    await recalculateProjectProgress(projectId);
    return unit;
  },

  updateUnit: async (projectId, unitNo, payload) => {
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    await u.update(payload);
    await recalculateProjectProgress(projectId);
    return u;
  },

  removeUnit: async (projectId, unitNo) => {
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    await u.destroy();
    await recalculateProjectProgress(projectId);
  },

  // ── Construction Statuses ──────────────────────────────────
  listConstructionStatuses: () => ConstructionStatus.findAll({ order: [["order_index", "ASC"]] }),

  createConstructionStatus: (payload) => ConstructionStatus.create(payload),

  updateConstructionStatus: async (id, payload) => {
    const s = await ConstructionStatus.findByPk(id);
    if (!s) throw { message: "Status konstruksi tidak ditemukan", status: 404 };
    await s.update(payload);
    return s;
  },

  removeConstructionStatus: async (id) => {
    const s = await ConstructionStatus.findByPk(id);
    if (!s) throw { message: "Status konstruksi tidak ditemukan", status: 404 };
    await s.destroy();
  },

  // ── Time Schedule ──────────────────────────────────────────
  listTimeSchedule: async (projectId, unitNo) => {
    if (unitNo) {
      const unit = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
      if (!unit) throw { message: "Unit tidak ditemukan", status: 404 };
      return TimeScheduleItem.findAll({ where: { ref_type: "project_unit", ref_id: unit.id }, order: [["created_at", "ASC"]] });
    }
    return TimeScheduleItem.findAll({ where: { ref_type: "project", ref_id: projectId }, order: [["created_at", "ASC"]] });
  },

  createTimeScheduleItem: async (projectId, unitNo, payload) => {
    let ref_type = "project";
    let ref_id = projectId;
    if (unitNo) {
      const unit = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
      if (!unit) throw { message: "Unit tidak ditemukan", status: 404 };
      ref_type = "project_unit";
      ref_id = unit.id;
    }
    return TimeScheduleItem.create({ ...payload, ref_type, ref_id });
  },

  updateTimeScheduleItem: async (projectId, unitNo, itemId, payload) => {
    let refFilter = { ref_type: "project", ref_id: projectId };
    if (unitNo) {
      const unit = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
      if (!unit) throw { message: "Unit tidak ditemukan", status: 404 };
      refFilter = { ref_type: "project_unit", ref_id: unit.id };
    }
    const item = await TimeScheduleItem.findOne({ where: { id: itemId, ...refFilter } });
    if (!item) throw { message: "Item time schedule tidak ditemukan", status: 404 };
    await item.update(payload);
    return item;
  },

  // ── Inventory Logs ─────────────────────────────────────────
  listInventoryLogs: (projectId) => InventoryLog.findAll({ where: { project_id: projectId }, order: [["date", "DESC"], ["created_at", "DESC"]] }),

  createInventoryLog: (projectId, payload, userId) => InventoryLog.create({ ...payload, project_id: projectId, created_by: userId }),

  // ── Work Logs ──────────────────────────────────────────────
  listWorkLogs: async (projectId, { unit_no } = {}) => {
    const where = { project_id: projectId };
    if (unit_no) where.unit_no = unit_no;
    return WorkLog.findAll({
      where,
      include: [{ model: WorkLogPhoto, as: "photos" }],
      order: [["date", "DESC"], ["created_at", "DESC"]],
    });
  },

  createWorkLog: async (projectId, payload, files, userId) => {
    let unit_id = null;
    if (payload.unit_no) {
      const unit = await ProjectUnit.findOne({ where: { project_id: projectId, no: payload.unit_no } });
      unit_id = unit ? unit.id : null;
    }
    const workLog = await WorkLog.create({
      project_id: projectId,
      unit_id,
      unit_no: payload.unit_no,
      reported_by: userId,
      date: payload.date,
      activity: payload.activity,
      worker_count: payload.worker_count,
      progress_added: payload.progress_added,
      status: payload.status,
      weather: payload.weather,
    });

    if (files?.length) {
      const dir = path.join(__dirname, "../../uploads/work-logs");
      ensureUploadDir(dir);
      const photos = files.map((file) => ({
        work_log_id: workLog.id,
        photo_url: `/uploads/work-logs/${file.filename}`,
        caption: file.originalname,
      }));
      await WorkLogPhoto.bulkCreate(photos);
    }
    return workLog;
  },

  updateWorkLog: async (projectId, logId, payload) => {
    const log = await WorkLog.findOne({ where: { id: logId, project_id: projectId } });
    if (!log) throw { message: "Work log tidak ditemukan", status: 404 };
    await log.update(payload);
    return log;
  },
};
