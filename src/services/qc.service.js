"use strict";

const { Op } = require("sequelize");
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
  return ProjectUnit.findOne({ where: { project_id: projectId, no: unitNo } });
};

const svc = {
  // ── Templates ───────────────────────────────────────────
  listTemplates: () => QcTemplate.findAll({ include: includeTemplateTree, order: templateOrder }),

  getTemplate: async (id) => {
    const tpl = await QcTemplate.findByPk(id, { include: includeTemplateTree, order: templateOrder });
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    return tpl;
  },

  createTemplate: async (payload = {}) => {
    const { sections, ...tplData } = payload;
    return sequelize.transaction(async (t) => {
      const tpl = await QcTemplate.create(tplData, { transaction: t });
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

  updateTemplate: async (id, payload) => {
    const tpl = await QcTemplate.findByPk(id);
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    await tpl.update(payload);
    return tpl;
  },

  removeTemplate: async (id) => {
    const tpl = await QcTemplate.findByPk(id);
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    await tpl.destroy();
  },

  duplicateTemplate: async (id) => {
    const original = await QcTemplate.findByPk(id, { include: includeTemplateTree, order: templateOrder });
    if (!original) throw { message: "Template QC tidak ditemukan", status: 404 };

    return sequelize.transaction(async (t) => {
      const copy = await QcTemplate.create(
        {
          name: `${original.name} (Copy)`,
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
  createSection: async (templateId, payload) => {
    const tpl = await QcTemplate.findByPk(templateId);
    if (!tpl) throw { message: "Template QC tidak ditemukan", status: 404 };
    const maxOrder = (await QcTemplateSection.max("order_index", { where: { template_id: templateId } })) || 0;
    return QcTemplateSection.create({
      template_id: templateId,
      name: payload.name,
      order_index: payload.order_index ?? maxOrder + 1,
    });
  },

  updateSection: async (templateId, sectionId, payload) => {
    const section = await QcTemplateSection.findOne({ where: { id: sectionId, template_id: templateId } });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    await section.update(payload);
    return section;
  },

  removeSection: async (templateId, sectionId) => {
    const section = await QcTemplateSection.findOne({ where: { id: sectionId, template_id: templateId } });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    await section.destroy();
  },

  // ── Items ───────────────────────────────────────────────
  createItem: async (templateId, sectionId, payload) => {
    const section = await QcTemplateSection.findOne({ where: { id: sectionId, template_id: templateId } });
    if (!section) throw { message: "Section tidak ditemukan", status: 404 };
    const maxOrder = (await QcTemplateItem.max("order_index", { where: { section_id: sectionId } })) || 0;
    return QcTemplateItem.create({
      section_id: sectionId,
      description: payload.description,
      order_index: payload.order_index ?? maxOrder + 1,
    });
  },

  updateItem: async (templateId, sectionId, itemId, payload) => {
    const item = await QcTemplateItem.findOne({
      where: { id: itemId, section_id: sectionId },
      include: [{ model: QcTemplateSection, as: "section", where: { template_id: templateId } }],
    });
    if (!item) throw { message: "Item tidak ditemukan", status: 404 };
    await item.update({ description: payload.description, order_index: payload.order_index });
    return item;
  },

  removeItem: async (templateId, sectionId, itemId) => {
    const item = await QcTemplateItem.findOne({
      where: { id: itemId, section_id: sectionId },
      include: [{ model: QcTemplateSection, as: "section", where: { template_id: templateId } }],
    });
    if (!item) throw { message: "Item tidak ditemukan", status: 404 };
    await item.destroy();
  },

  // ── Submissions ─────────────────────────────────────────
  listSubmissions: async ({ project_id, unit_no, unit_id, status, start_date, end_date } = {}) => {
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
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: ProjectUnit, as: "unit", attributes: ["id", "no", "tipe", "project_id"] },
        { model: QcTemplate, as: "template", attributes: ["id", "name"] },
      ],
      order: [["submission_date", "DESC"], ["created_at", "DESC"]],
    });
  },

  getSubmission: async (id) => {
    const submission = await QcSubmission.findByPk(id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
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

  createSubmission: async (payload, userId) => {
    const unit = payload.unit_id ? await ProjectUnit.findByPk(payload.unit_id) : await findUnitByNo(payload.project_id, payload.unit_no);
    if (payload.unit_id && !unit) throw { message: "Unit tidak ditemukan", status: 404 };
    if (payload.unit_no && !unit) throw { message: "Unit tidak ditemukan", status: 404 };
    if (payload.template_id) {
      const exists = await QcTemplate.findByPk(payload.template_id);
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

      return submission;
    });
  },

  updateSubmission: async (id, payload) => {
    const submission = await QcSubmission.findByPk(id, { include: [{ model: QcSubmissionResult, as: "results" }] });
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
      }
      return submission;
    });
  },

  submitSubmission: async (id, userId) => {
    const submission = await QcSubmission.findByPk(id);
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    if (submission.status !== "Draft") throw { message: "Submission sudah disubmit", status: 400 };
    await submission.update({ status: "Submitted", submitted_by: userId });
    return submission;
  },

  removeSubmission: async (id) => {
    const submission = await QcSubmission.findByPk(id);
    if (!submission) throw { message: "Submission QC tidak ditemukan", status: 404 };
    if (submission.status !== "Draft") throw { message: "Submission sudah disubmit", status: 400 };
    await submission.destroy();
  },

  exportSubmission: async (id) => {
    // Stub export: return data so PDF layer can handle externally
    const submission = await svc.getSubmission(id);
    return { submission };
  },
};

module.exports = svc;
