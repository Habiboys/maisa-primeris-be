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
  HousingUnit,
} = require("../models");
const { withTenantWhere, requireCompanyId } = require('../utils/tenant');

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

  // progress tidak boleh dibaca dari project.progress.
  // selalu dihitung dari rata-rata progress unit (jika ada).
  const units = await ProjectUnit.findAll({ where: { project_id: projectId } });
  let newProgress = 0;
  if (units.length > 0) {
    const total = units.reduce((sum, u) => sum + (u.progress ?? 0), 0);
    newProgress = Math.round(total / units.length);
  }

  await project.update({ progress: newProgress });
};

const getScopedProject = async (projectId, actor) => {
  const p = await Project.findOne({ where: withTenantWhere({ id: projectId }, actor) });
  if (!p) throw { message: 'Proyek tidak ditemukan', status: 404 };
  return p;
};

/**
 * Bulk-create N units for a project + auto-create corresponding housing_units.
 * Unit numbering: {prefix}-01, {prefix}-02, …
 * Skips units whose `no` already exists within the project.
 */
const bulkCreateUnits = async (projectId, { count, prefix, tipe }, companyId) => {
  const created = [];
  for (let i = 1; i <= count; i++) {
    const no = `${prefix}-${String(i).padStart(2, "0")}`;
    const existing = await ProjectUnit.findOne({ where: { project_id: projectId, no } });
    if (existing) continue;

    const unit = await ProjectUnit.create({
      project_id: projectId,
      no,
      tipe: tipe || null,
      progress: 0,
      status: null,
      qc_status: "Ongoing",
      qc_readiness: 0,
    });

    // Auto-create / relink housing unit (one-to-one ke project_unit)
    // Jangan match pakai `unit_code` saja karena bisa "nyangkut" dari data seed/other project.
    let existingHousing = await HousingUnit.findOne({ where: { project_unit_id: unit.id, company_id: companyId } });
    if (!existingHousing) {
      // Fallback untuk data lama yang belum punya project_unit_id (atau relasinya belum benar)
      existingHousing = await HousingUnit.findOne({ where: { unit_code: no, company_id: companyId } });
    }

    const wipePayload = {
      // relasi
      project_id: projectId,
      project_unit_id: unit.id,

      // basic
      unit_code: no,
      unit_type: tipe || null,
      status: "Tersedia",
      notes: "",
      consumer_id: null,

      // wipe detail kavling agar project baru tidak ikut membawa isi dari project lain
      luas_tanah: null,
      luas_bangunan: null,
      harga_per_meter: null,
      harga_jual: null,
      daya_listrik: null,
      panjang_kanan: null,
      panjang_kiri: null,
      lebar_depan: null,
      lebar_belakang: null,
      id_rumah: null,
      no_sertifikat: null,
      akad_date: null,
      serah_terima_date: null,
      photo_url: null,
    };

    if (!existingHousing) {
      await HousingUnit.create({
        company_id: companyId,
        ...wipePayload,
      });
    } else {
      await existingHousing.update(wipePayload);
    }

    created.push(unit);
  }
  await recalculateProjectProgress(projectId);
  const totalUnits = await ProjectUnit.count({ where: { project_id: projectId } });
  await Project.update({ units_count: totalUnits }, { where: { id: projectId } });
  return created;
};

module.exports = {
  // ── Projects ──────────────────────────────────────────────
  listProjects: async ({ search, type, status, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: ProjectUnit, as: "units" }],
      order: [["created_at", "DESC"]],
      ...paginate(page, limit),
    });
    // overwrite project.progress dengan rata-rata unit
    const data = rows.map((p) => {
      const units = p.units ?? [];
      let avg = 0;
      if (units.length > 0) {
        const total = units.reduce((sum, u) => sum + (u.progress ?? 0), 0);
        avg = Math.round(total / units.length);
      }
      p.progress = avg;
      return p;
    });
    return { data, pagination: mkPagination(count, page, limit) };
  },

  getProjectById: async (id, actor) => {
    const p = await Project.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: ProjectUnit, as: "units" }],
    });
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    // overwrite progress dengan rata-rata unit
    const units = p.units ?? [];
    let avg = 0;
    if (units.length > 0) {
      const total = units.reduce((sum, u) => sum + (u.progress ?? 0), 0);
      avg = Math.round(total / units.length);
    }
    p.progress = avg;
    return p;
  },

  createProject: async (payload, actor) => {
    const companyId = requireCompanyId(actor);
    const project = await Project.create({ ...payload, company_id: companyId });
    // Auto-create units jika units_count > 0 dan unit_prefix disediakan
    const unitsCount = parseInt(payload.units_count, 10) || 0;
    const unitPrefix = payload.unit_prefix;
    if (unitsCount > 0 && unitPrefix) {
      await bulkCreateUnits(project.id, {
        count: unitsCount,
        prefix: unitPrefix,
        tipe: payload.unit_tipe || null,
      }, companyId);
    }
    return project;
  },

  updateProject: async (id, payload, actor) => {
    const p = await Project.findOne({ where: withTenantWhere({ id }, actor) });
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    // units_count tidak boleh diubah via update — selalu dihitung dari jumlah unit aktual
    const { units_count, unit_prefix, unit_tipe, ...safePayload } = payload;
    await p.update(safePayload);
    return p;
  },

  removeProject: async (id, actor) => {
    const p = await Project.findOne({ where: withTenantWhere({ id }, actor) });
    if (!p) throw { message: "Proyek tidak ditemukan", status: 404 };
    await p.destroy();
  },

  bulkCreateUnitsForProject: async (projectId, payload, actor) => {
    const project = await getScopedProject(projectId, actor);
    const companyId = project.company_id;
    const count = parseInt(payload.count, 10) || 0;
    if (count <= 0 || !payload.prefix) throw { message: "count dan prefix wajib diisi", status: 400 };
    const created = await bulkCreateUnits(projectId, {
      count,
      prefix: payload.prefix,
      tipe: payload.tipe || null,
    }, companyId);
    return created;
  },

  // ── Project Units ──────────────────────────────────────────
  listUnits: async (projectId, actor) => {
    await getScopedProject(projectId, actor);
    // Urutkan berdasarkan `no` biar tampilan A-01..A-xx konsisten
    return ProjectUnit.findAll({ where: { project_id: projectId }, order: [["no", "ASC"]] });
  },

  getUnit: async (projectId, unitNo, actor) => {
    await getScopedProject(projectId, actor);
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    return u;
  },

  createUnit: async (projectId, payload, actor) => {
    await getScopedProject(projectId, actor);
    const unit = await ProjectUnit.create({ ...payload, project_id: projectId });
    await recalculateProjectProgress(projectId);
    return unit;
  },

  updateUnit: async (projectId, unitNo, payload, actor) => {
    await getScopedProject(projectId, actor);
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    await u.update(payload);
    await recalculateProjectProgress(projectId);
    return u;
  },

  removeUnit: async (projectId, unitNo, actor) => {
    await getScopedProject(projectId, actor);
    const u = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
    if (!u) throw { message: "Unit tidak ditemukan", status: 404 };
    await u.destroy();
    await recalculateProjectProgress(projectId);
  },

  // ── Construction Statuses ──────────────────────────────────
  listConstructionStatuses: (actor) => ConstructionStatus.findAll({ where: withTenantWhere({}, actor), order: [["order_index", "ASC"]] }),

  createConstructionStatus: (payload, actor) => ConstructionStatus.create({ ...payload, company_id: requireCompanyId(actor) }),

  updateConstructionStatus: async (id, payload, actor) => {
    const s = await ConstructionStatus.findOne({ where: withTenantWhere({ id }, actor) });
    if (!s) throw { message: "Status konstruksi tidak ditemukan", status: 404 };
    await s.update(payload);
    return s;
  },

  removeConstructionStatus: async (id, actor) => {
    const s = await ConstructionStatus.findOne({ where: withTenantWhere({ id }, actor) });
    if (!s) throw { message: "Status konstruksi tidak ditemukan", status: 404 };
    await s.destroy();
  },

  // ── Time Schedule ──────────────────────────────────────────
  listTimeSchedule: async (projectId, unitNo, actor) => {
    await getScopedProject(projectId, actor);
    if (unitNo) {
      const unit = await ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
      if (!unit) throw { message: "Unit tidak ditemukan", status: 404 };
      return TimeScheduleItem.findAll({ where: { ref_type: "project_unit", ref_id: unit.id }, order: [["created_at", "ASC"]] });
    }
    return TimeScheduleItem.findAll({ where: { ref_type: "project", ref_id: projectId }, order: [["created_at", "ASC"]] });
  },

  createTimeScheduleItem: async (projectId, unitNo, payload, actor) => {
    await getScopedProject(projectId, actor);
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

  updateTimeScheduleItem: async (projectId, unitNo, itemId, payload, actor) => {
    await getScopedProject(projectId, actor);
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
  listInventoryLogs: async (projectId, actor) => {
    await getScopedProject(projectId, actor);
    return InventoryLog.findAll({ where: { project_id: projectId }, order: [["date", "DESC"], ["created_at", "DESC"]] });
  },

  createInventoryLog: async (projectId, payload, userId, actor) => {
    await getScopedProject(projectId, actor);
    // Catatan:
    // Schema inventory_logs masih menyimpan legacy field `item_name` (NOT NULL),
    // sementara frontend kita mengirim field modern `item`.
    // Supaya insertion tidak gagal, sinkronkan keduanya.
    const item = payload?.item ?? payload?.item_name;
    const safePayload = {
      ...payload,
      item,
      // schema masih mewajibkan legacy `item_name`
      item_name: payload?.item_name ?? item,
    };
    return InventoryLog.create({ ...safePayload, project_id: projectId, created_by: userId });
  },

  // ── Work Logs ──────────────────────────────────────────────
  listWorkLogs: async (projectId, { unit_no } = {}, actor) => {
    await getScopedProject(projectId, actor);
    const where = { project_id: projectId };
    if (unit_no) where.unit_no = unit_no;
    return WorkLog.findAll({
      where,
      include: [{ model: WorkLogPhoto, as: "photos" }],
      order: [["date", "DESC"], ["created_at", "DESC"]],
    });
  },

  createWorkLog: async (projectId, payload, files, userId, actor) => {
    await getScopedProject(projectId, actor);
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

  updateWorkLog: async (projectId, logId, payload, actor) => {
    await getScopedProject(projectId, actor);
    const log = await WorkLog.findOne({ where: { id: logId, project_id: projectId } });
    if (!log) throw { message: "Work log tidak ditemukan", status: 404 };
    await log.update(payload);
    return log;
  },
};
