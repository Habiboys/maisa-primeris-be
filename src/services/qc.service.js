"use strict";

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const {
  sequelize,
  QcTemplate,
  QcTemplateSection,
  QcTemplateItem,
  QcSubmission,
  QcSubmissionResult,
  Project,
  ProjectUnit,
} = require("../models");
const { withTenantWhere, requireCompanyId } = require('../utils/tenant');

const templateOrder = [
  [{ model: QcTemplateSection, as: "sections" }, "order_index", "ASC"],
  [
    { model: QcTemplateSection, as: "sections" },
    { model: QcTemplateItem, as: "items" },
    "order_index",
    "ASC",
  ],
];

const normalizeResult = (val) => {
  const v = (val || "").toString().toLowerCase();
  if (v === "ok") return "OK";
  if (v === "not ok" || v === "not_ok" || v === "notok" || v === "fail") return "Not OK";
  if (v === "n/a" || v === "na") return "N/A";
  return null;
};

const includeTemplateTree = [
  {
    model: QcTemplateSection,
    as: "sections",
    include: [{ model: QcTemplateItem, as: "items" }],
  },
];

const findUnitByNo = async (projectId, unitNo) => {
  if (!unitNo) return null;
  const where = { no: unitNo };
  if (projectId) where.project_id = projectId;
  return ProjectUnit.findOne({ where });
};

const sanitizeSheetName = (name = "Sheet") => {
  const cleaned = String(name)
    .replace(/[\\/*?:\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "Sheet").slice(0, 31);
};

const toYesNoMark = (result) => {
  const r = (result || "").toString().toUpperCase();
  if (r === "OK") return { yes: "✓", no: "" };
  if (r === "NOT OK" || r === "NOT_OK") return { yes: "", no: "✓" };
  return { yes: "", no: "" };
};

const buildQcWorkbook = (title, submissions = []) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Maisa Primeris App";
  wb.created = new Date();

  const usedSheetNames = new Set();
  submissions.forEach((sub, idx) => {
    const rawName = `${sub.unit?.no || sub.unit_no || `Unit-${idx + 1}`}`;
    let sheetName = sanitizeSheetName(rawName);
    if (usedSheetNames.has(sheetName)) {
      let i = 2;
      while (usedSheetNames.has(sanitizeSheetName(`${rawName} (${i})`))) i += 1;
      sheetName = sanitizeSheetName(`${rawName} (${i})`);
    }
    usedSheetNames.add(sheetName);
    const ws = wb.addWorksheet(sheetName);

    ws.mergeCells("A1:G1");
    ws.getCell("A1").value = `Laporan QC ${sub.project?.name || ""} - Unit ${sub.unit?.no || sub.unit_no || "-"}`;
    ws.getCell("A1").font = { bold: true, size: 13 };

    ws.getCell("A2").value = "ID Submission";
    ws.getCell("B2").value = sub.id;
    ws.getCell("A3").value = "Tanggal QC";
    ws.getCell("B3").value = sub.submission_date || "-";
    ws.getCell("A4").value = "Status";
    ws.getCell("B4").value = sub.status || "-";
    ws.getCell("A5").value = "Template";
    ws.getCell("B5").value = sub.template?.name || "-";
    ws.getCell("A6").value = "Export";
    ws.getCell("B6").value = `${title} • ${new Date().toLocaleString("id-ID")}`;

    ["A2", "A3", "A4", "A5", "A6"].forEach((ref) => {
      ws.getCell(ref).font = { bold: true };
    });

    let rowCursor = 8;
    (sub.template?.sections || []).forEach((section) => {
      ws.mergeCells(`A${rowCursor}:G${rowCursor}`);
      ws.getCell(`A${rowCursor}`).value = section.name || "Section";
      ws.getCell(`A${rowCursor}`).font = { bold: true, color: { argb: "FF1D4ED8" } };
      rowCursor += 1;

      ws.getRow(rowCursor).values = ["No", "Pertanyaan Checklist", "Yes", "No", "Catatan", "Last Update", "Gambar"];
      ws.getRow(rowCursor).font = { bold: true };
      ws.getRow(rowCursor).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      rowCursor += 1;

      (section.items || []).forEach((item, itemIdx) => {
        const res = (sub.results || []).find((r) => r.item_id === item.id || r.templateItem?.id === item.id);
        const mark = toYesNoMark(res?.result);
        const row = ws.getRow(rowCursor);
        row.getCell(1).value = itemIdx + 1;
        row.getCell(2).value = item.description || "-";
        row.getCell(3).value = mark.yes;
        row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(4).value = mark.no;
        row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(5).value = res?.notes || "-";
        row.getCell(6).value = res?.updated_at || res?.created_at || "-";

        if (res?.photo_url) {
          row.getCell(7).value = { text: "Lihat Gambar", hyperlink: res.photo_url };
          row.getCell(7).font = { color: { argb: "FF2563EB" }, underline: true };
        } else {
          row.getCell(7).value = "-";
        }
        rowCursor += 1;
      });

      rowCursor += 1;
    });

    ws.columns = [
      { width: 7 },
      { width: 52 },
      { width: 8 },
      { width: 8 },
      { width: 34 },
      { width: 22 },
      { width: 20 },
    ];

    for (let r = 8; r <= rowCursor; r += 1) {
      ws.getRow(r).eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        cell.alignment = { vertical: "top", wrapText: true };
      });
    }
  });

  return wb;
};

const svc = {
  // ── Templates ───────────────────────────────────────────
  listTemplates: (actor) => QcTemplate.findAll({ where: withTenantWhere({}, actor), include: includeTemplateTree, order: templateOrder }),

  getTemplate: async (id, actor) => {
    const tpl = await QcTemplate.findOne({ where: withTenantWhere({ id }, actor), include: includeTemplateTree, order: templateOrder });
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    return tpl;
  },

  createTemplate: async (payload = {}, actor) => {
    const { sections, ...tplData } = payload;
    return sequelize.transaction(async (t) => {
      const tpl = await QcTemplate.create({ ...tplData, company_id: requireCompanyId(actor) }, { transaction: t });
      if (Array.isArray(sections)) {
        for (let i = 0; i < sections.length; i += 1) {
          const section = sections[i];
          const newSection = await QcTemplateSection.create(
            {
              template_id: tpl.id,
              name: section.name,
              order_index: section.order_index ?? i,
            },
            { transaction: t }
          );
          if (Array.isArray(section.items)) {
            const items = section.items.map((it, idx) => ({
              section_id: newSection.id,
              description: it.description,
              order_index: it.order_index ?? idx,
            }));
            await QcTemplateItem.bulkCreate(items, { transaction: t });
          }
        }
      }
      return tpl;
    });
  },

  updateTemplate: async (id, payload, actor) => {
    const tpl = await QcTemplate.findOne({ where: withTenantWhere({ id }, actor) });
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };

    return sequelize.transaction(async (t) => {
      // 1. Update info template dasar
      const safeUpdate = {};
      if (payload.name !== undefined) safeUpdate.name = payload.name;
      if (payload.description !== undefined) safeUpdate.description = payload.description;
      if (payload.is_active !== undefined) safeUpdate.is_active = payload.is_active;
      await tpl.update(safeUpdate, { transaction: t });

      // 2. Sinkronisasi sections dan items jika dikirim dari frontend
      if (Array.isArray(payload.sections)) {
        const isUUID = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
        
        const existingSections = await QcTemplateSection.findAll({ where: { template_id: id }, transaction: t });
        const existingSectionIds = existingSections.map((s) => s.id);
        const payloadSectionIds = payload.sections.map((s) => s.id).filter(isUUID);
        
        const sectionsToDelete = existingSectionIds.filter((sid) => !payloadSectionIds.includes(sid));
        if (sectionsToDelete.length > 0) {
          await QcTemplateSection.destroy({ where: { id: sectionsToDelete }, transaction: t });
        }

        for (let i = 0; i < payload.sections.length; i++) {
          const sec = payload.sections[i];
          let sectionId = sec.id;
          
          if (!isUUID(sec.id)) {
            const newSec = await QcTemplateSection.create({
              template_id: id,
              name: sec.name,
              order_index: sec.order_index ?? i,
            }, { transaction: t });
            sectionId = newSec.id;
          } else {
            await QcTemplateSection.update({
              name: sec.name,
              order_index: sec.order_index ?? i,
            }, { where: { id: sectionId }, transaction: t });
          }

          if (Array.isArray(sec.items)) {
            const existingItems = await QcTemplateItem.findAll({ where: { section_id: sectionId }, transaction: t });
            const existingItemIds = existingItems.map((it) => it.id);
            const payloadItemIds = sec.items.map((it) => it.id).filter(isUUID);

            const itemsToDelete = existingItemIds.filter((iid) => !payloadItemIds.includes(iid));
            if (itemsToDelete.length > 0) {
              await QcTemplateItem.destroy({ where: { id: itemsToDelete }, transaction: t });
            }

            for (let j = 0; j < sec.items.length; j++) {
              const it = sec.items[j];
              if (!isUUID(it.id)) {
                await QcTemplateItem.create({
                  section_id: sectionId,
                  description: it.description,
                  order_index: it.order_index ?? j,
                }, { transaction: t });
              } else {
                await QcTemplateItem.update({
                  description: it.description,
                  order_index: it.order_index ?? j,
                }, { where: { id: it.id }, transaction: t });
              }
            }
          }
        }
      }
      return tpl;
    });
  },

  removeTemplate: async (id, actor) => {
    const tpl = await QcTemplate.findOne({ where: withTenantWhere({ id }, actor) });
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    await tpl.destroy();
  },

  duplicateTemplate: async (id, actor) => {
    const original = await QcTemplate.findOne({ where: withTenantWhere({ id }, actor), include: includeTemplateTree, order: templateOrder });
    if (!original) throw { message: "Template QC tidak ditemukan", status: 404 };

    return sequelize.transaction(async (t) => {
      const copy = await QcTemplate.create(
        {
          name: `${original.name} (Copy)`,
          company_id: original.company_id,
          description: original.description,
          is_active: original.is_active,
        },
        { transaction: t }
      );

      for (const section of original.sections || []) {
        const newSection = await QcTemplateSection.create(
          {
            template_id: copy.id,
            name: section.name,
            order_index: section.order_index,
          },
          { transaction: t }
        );

        if (Array.isArray(section.items) && section.items.length) {
          const items = section.items.map((item) => ({
            section_id: newSection.id,
            description: item.description,
            order_index: item.order_index,
          }));
          await QcTemplateItem.bulkCreate(items, { transaction: t });
        }
      }
      return copy;
    });
  },

  // ── Sections ────────────────────────────────────────────
  createSection: async (templateId, payload, actor) => {
    const tpl = await QcTemplate.findOne({ where: withTenantWhere({ id: templateId }, actor) });
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    const maxOrder = (await QcTemplateSection.max("order_index", { where: { template_id: templateId } })) || 0;
    return QcTemplateSection.create({
      template_id: templateId,
      name: payload.name,
      order_index: payload.order_index ?? maxOrder + 1,
    });
  },

  updateSection: async (templateId, sectionId, payload, actor) => {
    const section = await QcTemplateSection.findOne({
      where: { id: sectionId, template_id: templateId },
      include: [{ model: QcTemplate, as: 'template', where: withTenantWhere({}, actor), required: true }],
    });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    await section.update(payload);
    return section;
  },

  removeSection: async (templateId, sectionId, actor) => {
    const section = await QcTemplateSection.findOne({
      where: { id: sectionId, template_id: templateId },
      include: [{ model: QcTemplate, as: 'template', where: withTenantWhere({}, actor), required: true }],
    });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    await section.destroy();
  },

  // ── Items ───────────────────────────────────────────────
  createItem: async (templateId, sectionId, payload, actor) => {
    const section = await QcTemplateSection.findOne({
      where: { id: sectionId, template_id: templateId },
      include: [{ model: QcTemplate, as: 'template', where: withTenantWhere({}, actor), required: true }],
    });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    const maxOrder = (await QcTemplateItem.max("order_index", { where: { section_id: sectionId } })) || 0;
    return QcTemplateItem.create({
      section_id: sectionId,
      description: payload.description,
      order_index: payload.order_index ?? maxOrder + 1,
    });
  },

  updateItem: async (templateId, sectionId, itemId, payload, actor) => {
    const item = await QcTemplateItem.findOne({
      where: { id: itemId, section_id: sectionId },
      include: [{
        model: QcTemplateSection,
        as: "section",
        where: { template_id: templateId },
        include: [{ model: QcTemplate, as: 'template', where: withTenantWhere({}, actor), required: true }],
      }],
    });
    if (!item) throw { message: "Item tidak ditemukan", status: 404 };
    await item.update({ description: payload.description, order_index: payload.order_index });
    return item;
  },

  removeItem: async (templateId, sectionId, itemId, actor) => {
    const item = await QcTemplateItem.findOne({
      where: { id: itemId, section_id: sectionId },
      include: [{
        model: QcTemplateSection,
        as: "section",
        where: { template_id: templateId },
        include: [{ model: QcTemplate, as: 'template', where: withTenantWhere({}, actor), required: true }],
      }],
    });
    if (!item) throw { message: "Item tidak ditemukan", status: 404 };
    await item.destroy();
  },

  // ── Submissions ─────────────────────────────────────────
  listSubmissions: async ({ project_id, unit_no, unit_id, status, start_date, end_date } = {}, actor) => {
    const where = {};
    if (project_id) where.project_id = project_id;
    if (unit_id) where.unit_id = unit_id;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.submission_date = {};
      if (start_date) where.submission_date[Op.gte] = start_date;
      if (end_date) where.submission_date[Op.lte] = end_date;
    }

    if (!unit_id && unit_no) {
      const unit = await findUnitByNo(project_id, unit_no);
      where.unit_id = unit ? unit.id : "__none__"; // ensures empty result when unit not found
    }

    return QcSubmission.findAll({
      where,
      include: [
        { model: Project, as: "project", attributes: ["id", "name"], where: withTenantWhere({}, actor), required: true },
        { model: ProjectUnit, as: "unit", attributes: ["id", "no", "tipe", "project_id"] },
        { model: QcTemplate, as: "template", attributes: ["id", "name"] },
      ],
      order: [["submission_date", "DESC"], ["created_at", "DESC"]],
    });
  },

  getSubmission: async (id, actor) => {
    const submission = await QcSubmission.findOne({
      where: { id },
      include: [
        { model: Project, as: "project", attributes: ["id", "name"], where: withTenantWhere({}, actor), required: true },
        { model: ProjectUnit, as: "unit", attributes: ["id", "no", "tipe", "project_id"] },
        { model: QcTemplate, as: "template", include: includeTemplateTree, order: templateOrder },
        { model: QcSubmissionResult, as: "results", include: [{ model: QcTemplateItem, as: "templateItem" }] },
      ],
      order: [
        [
          { model: QcTemplate, as: "template" },
          { model: QcTemplateSection, as: "sections" },
          "order_index",
          "ASC",
        ],
        [
          { model: QcTemplate, as: "template" },
          { model: QcTemplateSection, as: "sections" },
          { model: QcTemplateItem, as: "items" },
          "order_index",
          "ASC",
        ],
        [{ model: QcSubmissionResult, as: "results" }, "created_at", "ASC"],
        [{ model: QcSubmissionResult, as: "results" }, "id", "ASC"],
      ],
    });
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    return submission;
  },

  createSubmission: async (payload, userId, actor) => {
    const project = await Project.findOne({ where: withTenantWhere({ id: payload.project_id }, actor) });
    if (!project) throw { message: 'Proyek tidak ditemukan', status: 404 };

    const unit = payload.unit_id ? await ProjectUnit.findByPk(payload.unit_id) : await findUnitByNo(payload.project_id, payload.unit_no);
    if (payload.unit_id && !unit) throw { message: "Unit tidak ditemukan", status: 404 };
    // unit_no not found is OK for standalone projects — submission will be created without a unit link
    if (payload.template_id) {
      const exists = await QcTemplate.findOne({ where: withTenantWhere({ id: payload.template_id }, actor) });
      if (!exists) throw { message: "Template QC tidak ditemukan", status: 404 };
    }

    return sequelize.transaction(async (t) => {
      const submission = await QcSubmission.create(
        {
          project_id: payload.project_id,
          unit_id: unit ? unit.id : null,
          template_id: payload.template_id,
          submission_date: payload.submission_date,
          notes: payload.notes,
          status: payload.status || "Draft",
          submitted_by: payload.status === "Submitted" ? userId : null,
        },
        { transaction: t }
      );

      if (Array.isArray(payload.results) && payload.results.length) {
        const rows = payload.results.map((r) => ({
          submission_id: submission.id,
          item_id: r.template_item_id || r.item_id,
          result: normalizeResult(r.result || r.status),
          notes: r.notes || r.remarks || null,
          photo_url: r.photo_url || r.photo || null,
        }));
        await QcSubmissionResult.bulkCreate(rows, { transaction: t });
      }

      // Recalculate unit QC readiness
      if (unit) {
        const normalized = (payload.results || []).map((r) => normalizeResult(r.result || r.status));
        const total = normalized.length;
        const checkedCount = normalized.filter((r) => r !== null).length;
        const failCount = normalized.filter((r) => r === 'Not OK').length;
        const qc_readiness = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
        const qc_status = failCount > 0 ? 'Fail' : (checkedCount === total && total > 0 ? 'Pass' : 'Ongoing');
        await ProjectUnit.update({ qc_readiness, qc_status }, { where: { id: unit.id }, transaction: t });
      }

      return submission;
    });
  },

  updateSubmission: async (id, payload, actor) => {
    const submission = await QcSubmission.findOne({
      where: { id },
      include: [
        { model: QcSubmissionResult, as: "results" },
        { model: Project, as: 'project', where: withTenantWhere({}, actor), required: true },
      ],
    });
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    if (submission.status !== "Draft") throw { message: "Submission sudah dikunci", status: 400 };

    return sequelize.transaction(async (t) => {
      await submission.update(
        {
          submission_date: payload.submission_date ?? submission.submission_date,
          notes: payload.notes ?? submission.notes,
        },
        { transaction: t }
      );

      if (Array.isArray(payload.results)) {
        await QcSubmissionResult.destroy({ where: { submission_id: id }, transaction: t });
        if (payload.results.length) {
          const rows = payload.results.map((r) => ({
            submission_id: submission.id,
            item_id: r.template_item_id || r.item_id,
            result: normalizeResult(r.result || r.status),
            notes: r.notes || r.remarks || null,
            photo_url: r.photo_url || r.photo || null,
          }));
          await QcSubmissionResult.bulkCreate(rows, { transaction: t });
        }

        // Recalculate unit QC readiness (penting untuk kasus simpan draft berkali-kali)
        if (submission.unit_id) {
          const normalized = (payload.results || []).map((r) => normalizeResult(r.result || r.status));
          const total = normalized.length;
          const checkedCount = normalized.filter((r) => r !== null).length;
          const failCount = normalized.filter((r) => r === 'Not OK').length;
          const qc_readiness = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
          const qc_status = failCount > 0 ? 'Fail' : (checkedCount === total && total > 0 ? 'Pass' : 'Ongoing');
          await ProjectUnit.update(
            { qc_readiness, qc_status },
            { where: { id: submission.unit_id }, transaction: t }
          );
        }
      }
      return submission;
    });
  },

  submitSubmission: async (id, userId, actor) => {
    const submission = await QcSubmission.findOne({
      where: { id },
      include: [{ model: Project, as: 'project', where: withTenantWhere({}, actor), required: true }],
    });
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    if (submission.status !== "Draft") throw { message: "Submission sudah disubmit", status: 400 };

    return sequelize.transaction(async (t) => {
      await submission.update({ status: "Submitted", submitted_by: userId }, { transaction: t });

      // Recalculate unit QC readiness on final submit
      if (submission.unit_id) {
        const results = await QcSubmissionResult.findAll({ where: { submission_id: id }, transaction: t });
        const total = results.length;
        const checkedCount = results.filter((r) => r.result !== null).length;
        const failCount = results.filter((r) => r.result === 'Not OK').length;
        const qc_readiness = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
        const qc_status = failCount > 0 ? 'Fail' : (checkedCount === total && total > 0 ? 'Pass' : 'Ongoing');
        await ProjectUnit.update({ qc_readiness, qc_status }, { where: { id: submission.unit_id }, transaction: t });
      }

      return submission;
    });
  },

  removeSubmission: async (id, actor) => {
    const submission = await QcSubmission.findOne({
      where: { id },
      include: [{ model: Project, as: 'project', where: withTenantWhere({}, actor), required: true }],
    });
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    if (submission.status !== "Draft") throw { message: "Submission sudah disubmit", status: 400 };
    await submission.destroy();
  },

  exportSubmission: async (id, actor) => {
    const submission = await svc.getSubmission(id, actor);
    const wb = buildQcWorkbook(`QC - Unit ${submission.unit?.no || submission.unit_no || "-"}`, [submission]);
    const buffer = await wb.xlsx.writeBuffer();
    return {
      buffer,
      fileName: `qc-unit-${submission.unit?.no || submission.unit_no || "unknown"}-${submission.submission_date || "report"}.xlsx`,
    };
  },

  exportProjectSubmissions: async (projectId, { unit_no } = {}, actor) => {
    const project = await Project.findOne({ where: withTenantWhere({ id: projectId }, actor) });
    if (!project) throw { message: "Proyek tidak ditemukan", status: 404 };

    const list = await svc.listSubmissions({ project_id: projectId, unit_no }, actor);
    if (!list.length) throw { message: "Data QC tidak ditemukan", status: 404 };

    let selected = [];
    if (unit_no) {
      const latest = [...list].sort((a, b) => {
        const sa = Math.max(new Date(a.submission_date || 0).getTime(), new Date(a.updated_at || 0).getTime(), new Date(a.created_at || 0).getTime());
        const sb = Math.max(new Date(b.submission_date || 0).getTime(), new Date(b.updated_at || 0).getTime(), new Date(b.created_at || 0).getTime());
        return sb - sa;
      })[0];
      selected = latest ? [latest] : [];
    } else {
      const latestPerUnit = new Map();
      list.forEach((sub) => {
        const key = sub.unit?.no || sub.unit_no;
        if (!key) return;
        const prev = latestPerUnit.get(key);
        const score = Math.max(new Date(sub.submission_date || 0).getTime(), new Date(sub.updated_at || 0).getTime(), new Date(sub.created_at || 0).getTime());
        const prevScore = prev
          ? Math.max(new Date(prev.submission_date || 0).getTime(), new Date(prev.updated_at || 0).getTime(), new Date(prev.created_at || 0).getTime())
          : -1;
        if (!prev || score > prevScore) latestPerUnit.set(key, sub);
      });
      selected = Array.from(latestPerUnit.values()).sort((a, b) => (a.unit?.no || a.unit_no || "").localeCompare(b.unit?.no || b.unit_no || ""));
    }

    const detailed = await Promise.all(selected.map((s) => svc.getSubmission(s.id, actor)));
    const title = unit_no ? `QC Unit ${unit_no} - ${project.name}` : `QC Semua Unit - ${project.name}`;
    const wb = buildQcWorkbook(title, detailed);
    const buffer = await wb.xlsx.writeBuffer();
    return {
      buffer,
      fileName: unit_no
        ? `qc-${project.name}-${unit_no}.xlsx`
        : `qc-${project.name}-semua-unit.xlsx`,
    };
  },
};

module.exports = svc;
