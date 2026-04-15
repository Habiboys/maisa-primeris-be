'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');
const {
  sequelize,
  JobCategory,
  Logbook,
  LogbookFile,
  MeetingNote,
  MeetingAction,
  User,
} = require('../models');
const { requireCompanyId, withTenantWhere, isPlatformOwner } = require('../utils/tenant');

const DEFAULT_JOB_CATEGORIES = [
  'Desain 2D',
  'Desain 3D',
  'Revisi Gambar',
  'Survey Lapangan',
  'Koordinasi Tim',
  'Lainnya',
];

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};

const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return {
    page: parseInt(page, 10) || 1,
    limit: lim,
    total: count,
    total_pages: Math.ceil(count / lim),
  };
};

const canManage = (ownerUserId, actor) => {
  if (isPlatformOwner(actor)) return true;
  if (actor?.role === 'Super Admin' || actor?.role === 'Project Management') return true;
  return String(ownerUserId) === String(actor?.id);
};

const parseParticipantsToText = (participants) => {
  if (Array.isArray(participants)) {
    return participants.map((p) => String(p).trim()).filter(Boolean).join(', ');
  }
  if (participants === null || participants === undefined) return '';
  return String(participants).trim();
};

const richTextToPlainText = (value) => {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return String(value)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return parsed
      .map((node) => (node?.children || [])
        .map((child) => (typeof child?.text === 'string' ? child.text : ''))
        .join(''))
      .join('\n')
      .trim();
  } catch {
    return String(value)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }
};

const ensureDefaultJobCategories = async (actor) => {
  if (isPlatformOwner(actor) && !actor?.company_id) return;
  const companyId = requireCompanyId(actor);

  try {
    await JobCategory.bulkCreate(
      DEFAULT_JOB_CATEGORIES.map((name) => ({ company_id: companyId, name })),
      { ignoreDuplicates: true },
    );
  } catch (error) {
    // Bisa terjadi saat request paralel pertama kali membuka halaman logbook.
    // Abaikan unique/validation error agar endpoint list tetap aman.
    if (error?.name !== 'SequelizeUniqueConstraintError' && error?.name !== 'SequelizeValidationError') {
      throw error;
    }
  }
};

const ensureCategoryInTenant = async (jobCategoryId, actor, transaction) => {
  const category = await JobCategory.findOne({
    where: withTenantWhere({ id: jobCategoryId }, actor),
    transaction,
  });
  if (!category) throw { message: 'Kategori pekerjaan tidak ditemukan', status: 404 };
  return category;
};

const ensureAssignedUsersInTenant = async (actions = [], actor, transaction) => {
  const assigneeIds = Array.from(new Set(
    (actions || [])
      .map((item) => item?.assigned_to)
      .filter(Boolean),
  ));

  if (!assigneeIds.length) return;

  for (const assigneeId of assigneeIds) {
    const user = await User.findOne({
      where: withTenantWhere({ id: assigneeId }, actor),
      transaction,
    });
    if (!user) {
      throw { message: 'PIC action item tidak valid atau beda tenant', status: 400 };
    }
  }
};

const buildMeetingPdf = async (note) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  doc.on('data', chunks.push.bind(chunks));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.font('Helvetica-Bold').fontSize(14).text('NOTULENSI RAPAT', { align: 'center' });
  doc.moveDown(0.7);

  doc.font('Helvetica').fontSize(10);
  doc.text(`Judul       : ${note.title}`);
  doc.text(`Tanggal     : ${note.date}`);
  doc.text(`Tipe Rapat  : ${note.meeting_type}`);
  doc.text(`Peserta     : ${note.participants || '-'}`);
  doc.text(`Dibuat Oleh : ${note.creator?.name || '-'}`);

  doc.moveDown();
  doc.font('Helvetica-Bold').text('Topik Pembahasan');
  doc.font('Helvetica').text(richTextToPlainText(note.discussion) || '-');

  doc.moveDown();
  doc.font('Helvetica-Bold').text('Hasil / Keputusan');
  doc.font('Helvetica').text(richTextToPlainText(note.result) || '-');

  doc.moveDown();
  doc.font('Helvetica-Bold').text('Action Items');
  doc.font('Helvetica');
  if (!note.actions?.length) {
    doc.text('- Tidak ada action items -');
  } else {
    note.actions.forEach((item, idx) => {
      const assignee = item.assignee?.name || '-';
      const deadline = item.deadline || '-';
      doc.text(`${idx + 1}. ${item.task}`);
      doc.text(`   PIC: ${assignee} | Deadline: ${deadline}`);
    });
  }

  doc.end();
});

module.exports = {
  // ── Job Categories ─────────────────────────────────────────
  listJobCategories: async (actor) => {
    await ensureDefaultJobCategories(actor);
    return JobCategory.findAll({
      where: withTenantWhere({}, actor),
      order: [['name', 'ASC']],
    });
  },

  // ── Logbooks ───────────────────────────────────────────────
  getLogbookById: async (id, actor) => {
    const row = await Logbook.findOne({
      where: withTenantWhere({ id }, actor),
      include: [
        { model: JobCategory, as: 'jobCategory', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: LogbookFile, as: 'files', attributes: ['id', 'file_path', 'file_name'] },
      ],
    });
    if (!row) throw { message: 'Logbook tidak ditemukan', status: 404 };
    return row;
  },

  listLogbooks: async ({ search, user_id, job_category_id, status, date_from, date_to, page, limit } = {}, actor) => {
    await ensureDefaultJobCategories(actor);

    const where = withTenantWhere({}, actor);
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }
    if (user_id) where.user_id = user_id;
    if (job_category_id) where.job_category_id = job_category_id;
    if (status) where.status = status;
    if (date_from && date_to) {
      where.date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      where.date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.date = { [Op.lte]: date_to };
    }

    const { count, rows } = await Logbook.findAndCountAll({
      where,
      include: [
        { model: JobCategory, as: 'jobCategory', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: LogbookFile, as: 'files', attributes: ['id', 'file_path', 'file_name'] },
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      ...paginate(page, limit),
    });

    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  createLogbook: async (payload, files, actor) => {
    await ensureDefaultJobCategories(actor);

    const companyId = requireCompanyId(actor);
    const t = await sequelize.transaction();
    try {
      await ensureCategoryInTenant(payload.job_category_id, actor, t);

      const logbook = await Logbook.create({
        company_id: companyId,
        user_id: actor.id,
        date: payload.date,
        job_category_id: payload.job_category_id,
        description: payload.description,
        progress: payload.progress,
        status: payload.status || 'Draft',
      }, { transaction: t });

      if (files?.length) {
        await LogbookFile.bulkCreate(files.map((file) => ({
          logbook_id: logbook.id,
          file_path: `/uploads/logbooks/${file.filename}`,
          file_name: file.originalname,
        })), { transaction: t });
      }

      await t.commit();

      return Logbook.findByPk(logbook.id, {
        include: [
          { model: JobCategory, as: 'jobCategory', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: LogbookFile, as: 'files', attributes: ['id', 'file_path', 'file_name'] },
        ],
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  updateLogbook: async (id, payload, actor) => {
    const logbook = await Logbook.findOne({ where: withTenantWhere({ id }, actor) });
    if (!logbook) throw { message: 'Logbook tidak ditemukan', status: 404 };
    if (!canManage(logbook.user_id, actor)) throw { message: 'Anda tidak punya akses untuk mengubah logbook ini', status: 403 };

    if (payload.job_category_id) {
      await ensureCategoryInTenant(payload.job_category_id, actor);
    }

    await logbook.update({
      date: payload.date ?? logbook.date,
      job_category_id: payload.job_category_id ?? logbook.job_category_id,
      description: payload.description ?? logbook.description,
      progress: payload.progress ?? logbook.progress,
      status: payload.status ?? logbook.status,
    });

    return Logbook.findByPk(logbook.id, {
      include: [
        { model: JobCategory, as: 'jobCategory', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: LogbookFile, as: 'files', attributes: ['id', 'file_path', 'file_name'] },
      ],
    });
  },

  addLogbookFiles: async (id, files, actor) => {
    const logbook = await Logbook.findOne({ where: withTenantWhere({ id }, actor) });
    if (!logbook) throw { message: 'Logbook tidak ditemukan', status: 404 };
    if (!canManage(logbook.user_id, actor)) throw { message: 'Anda tidak punya akses untuk mengubah logbook ini', status: 403 };
    if (!files?.length) return [];

    return LogbookFile.bulkCreate(files.map((file) => ({
      logbook_id: logbook.id,
      file_path: `/uploads/logbooks/${file.filename}`,
      file_name: file.originalname,
    })));
  },

  deleteLogbookFile: async (id, fileId, actor) => {
    const logbook = await Logbook.findOne({ where: withTenantWhere({ id }, actor) });
    if (!logbook) throw { message: 'Logbook tidak ditemukan', status: 404 };
    if (!canManage(logbook.user_id, actor)) throw { message: 'Anda tidak punya akses untuk mengubah logbook ini', status: 403 };

    const file = await LogbookFile.findOne({ where: { id: fileId, logbook_id: id } });
    if (!file) throw { message: 'File tidak ditemukan', status: 404 };

    const absolutePath = path.join(__dirname, '../..', file.file_path);
    if (fs.existsSync(absolutePath)) {
      try { fs.unlinkSync(absolutePath); } catch (_e) { /* noop */ }
    }

    await file.destroy();
  },

  deleteLogbook: async (id, actor) => {
    const logbook = await Logbook.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: LogbookFile, as: 'files', attributes: ['id', 'file_path'] }],
    });
    if (!logbook) throw { message: 'Logbook tidak ditemukan', status: 404 };
    if (!canManage(logbook.user_id, actor)) throw { message: 'Anda tidak punya akses untuk menghapus logbook ini', status: 403 };

    for (const file of (logbook.files || [])) {
      const absolutePath = path.join(__dirname, '../..', file.file_path);
      if (fs.existsSync(absolutePath)) {
        try { fs.unlinkSync(absolutePath); } catch (_e) { /* noop */ }
      }
    }

    await logbook.destroy();
  },

  // ── Meeting Notes ──────────────────────────────────────────
  listMeetingNotes: async ({ search, meeting_type, date_from, date_to, created_by, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (meeting_type) where.meeting_type = meeting_type;
    if (created_by) where.created_by = created_by;
    if (date_from && date_to) {
      where.date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      where.date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.date = { [Op.lte]: date_to };
    }

    const { count, rows } = await MeetingNote.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: MeetingAction,
          as: 'actions',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'], required: false }],
        },
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      ...paginate(page, limit),
    });

    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMeetingNoteById: async (id, actor) => {
    const note = await MeetingNote.findOne({
      where: withTenantWhere({ id }, actor),
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: MeetingAction,
          as: 'actions',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'], required: false }],
        },
      ],
      order: [[{ model: MeetingAction, as: 'actions' }, 'created_at', 'ASC']],
    });

    if (!note) throw { message: 'Notulensi tidak ditemukan', status: 404 };
    return note;
  },

  createMeetingNote: async (payload, actor) => {
    const companyId = requireCompanyId(actor);
    const t = await sequelize.transaction();
    try {
      await ensureAssignedUsersInTenant(payload.actions || [], actor, t);

      const note = await MeetingNote.create({
        company_id: companyId,
        title: payload.title,
        date: payload.date,
        meeting_type: payload.meeting_type,
        participants: parseParticipantsToText(payload.participants),
        discussion: payload.discussion,
        result: payload.result,
        created_by: actor.id,
      }, { transaction: t });

      const actions = (payload.actions || []).map((item) => ({
        meeting_note_id: note.id,
        task: item.task,
        assigned_to: item.assigned_to || null,
        deadline: item.deadline || null,
      }));

      if (actions.length) {
        await MeetingAction.bulkCreate(actions, { transaction: t });
      }

      await t.commit();
      return module.exports.getMeetingNoteById(note.id, actor);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  updateMeetingNote: async (id, payload, actor) => {
    const note = await MeetingNote.findOne({ where: withTenantWhere({ id }, actor) });
    if (!note) throw { message: 'Notulensi tidak ditemukan', status: 404 };
    if (!canManage(note.created_by, actor)) throw { message: 'Anda tidak punya akses untuk mengubah notulensi ini', status: 403 };

    const t = await sequelize.transaction();
    try {
      if (Array.isArray(payload.actions)) {
        await ensureAssignedUsersInTenant(payload.actions, actor, t);
      }

      await note.update({
        title: payload.title ?? note.title,
        date: payload.date ?? note.date,
        meeting_type: payload.meeting_type ?? note.meeting_type,
        participants: payload.participants !== undefined ? parseParticipantsToText(payload.participants) : note.participants,
        discussion: payload.discussion ?? note.discussion,
        result: payload.result ?? note.result,
      }, { transaction: t });

      if (Array.isArray(payload.actions)) {
        await MeetingAction.destroy({ where: { meeting_note_id: note.id }, transaction: t });
        const nextActions = payload.actions.map((item) => ({
          meeting_note_id: note.id,
          task: item.task,
          assigned_to: item.assigned_to || null,
          deadline: item.deadline || null,
        }));
        if (nextActions.length) {
          await MeetingAction.bulkCreate(nextActions, { transaction: t });
        }
      }

      await t.commit();
      return module.exports.getMeetingNoteById(note.id, actor);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  deleteMeetingNote: async (id, actor) => {
    const note = await MeetingNote.findOne({ where: withTenantWhere({ id }, actor) });
    if (!note) throw { message: 'Notulensi tidak ditemukan', status: 404 };
    if (!canManage(note.created_by, actor)) throw { message: 'Anda tidak punya akses untuk menghapus notulensi ini', status: 403 };

    await note.destroy();
  },

  exportMeetingNotePdf: async (id, actor) => {
    const note = await module.exports.getMeetingNoteById(id, actor);
    return buildMeetingPdf(note);
  },
};
