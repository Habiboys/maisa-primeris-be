'use strict';

const { Op, fn, col, literal } = require('sequelize');
const {
  WorkLocation, UserLocationAssignment, Attendance, LeaveRequest, User, AttendanceSetting,
} = require('../models');
const { withTenantWhere, requireCompanyId, isPlatformOwner } = require('../utils/tenant');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

const parseTimeToMinutes = (value) => {
  if (!value || typeof value !== 'string') return 0;
  const [h = '0', m = '0'] = value.split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};

const getOrCreateAttendanceSettings = async (actor) => {
  const baseWhere = withTenantWhere({}, actor);
  let setting = await AttendanceSetting.findOne({ where: baseWhere, order: [['created_at', 'ASC']] });
  if (!setting) {
    const companyId = requireCompanyId(actor);
    setting = await AttendanceSetting.create({
      company_id: companyId,
      work_start_time: process.env.ATTENDANCE_WORK_START_TIME || '08:00:00',
      work_end_time: process.env.ATTENDANCE_WORK_END_TIME || '17:00:00',
      late_grace_minutes: Number(process.env.ATTENDANCE_LATE_GRACE_MINUTES || 0),
    });
  }
  return setting;
};

// ── Helper: hitung jarak GPS (Haversine) ──────────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = {
  // ── Attendance Settings ───────────────────────────────────────

  getAttendanceSettings: async (actor) => getOrCreateAttendanceSettings(actor),

  updateAttendanceSettings: async (payload, actor) => {
    const setting = await getOrCreateAttendanceSettings(actor);
    await setting.update({
      work_start_time: payload.work_start_time ?? setting.work_start_time,
      work_end_time: payload.work_end_time ?? setting.work_end_time,
      late_grace_minutes: payload.late_grace_minutes ?? setting.late_grace_minutes,
    });
    return setting;
  },

  // ── Work Locations ─────────────────────────────────────────────

  listLocations: async (actor) => WorkLocation.findAll({ where: withTenantWhere({ is_active: true }, actor), order: [['name', 'ASC']] }),

  getLocationById: async (id, actor) => {
    const l = await WorkLocation.findOne({ where: withTenantWhere({ id }, actor) });
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    return l;
  },

  createLocation: async (payload, actor) => WorkLocation.create({ ...payload, company_id: requireCompanyId(actor) }),

  updateLocation: async (id, payload, actor) => {
    const l = await WorkLocation.findOne({ where: withTenantWhere({ id }, actor) });
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    await l.update(payload);
    return l;
  },

  removeLocation: async (id, actor) => {
    const l = await WorkLocation.findOne({ where: withTenantWhere({ id }, actor) });
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    await l.update({ is_active: false }); // soft delete
  },

  // ── User-Location Assignments ──────────────────────────────────

  listAssignments: async (actor) => UserLocationAssignment.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'], where: withTenantWhere({}, actor), required: true },
      { model: WorkLocation, as: 'location', attributes: ['id', 'name', 'address'], where: withTenantWhere({}, actor), required: true },
    ],
    order: [['created_at', 'DESC']],
  }),

  createAssignment: async ({ user_id, work_location_id }, actor) => {
    const companyWhere = withTenantWhere({}, actor);
    const user = await User.findOne({ where: { id: user_id, ...companyWhere } });
    const location = await WorkLocation.findOne({ where: { id: work_location_id, ...companyWhere, is_active: true } });
    if (!user || !location) throw { message: 'User/Lokasi lintas perusahaan tidak diizinkan', status: 400 };

    // Remove previous assignment for this user first (one-to-one)
    await UserLocationAssignment.destroy({ where: { user_id } });
    const a = await UserLocationAssignment.create({ user_id, work_location_id });
    await User.update({ work_location_id }, { where: { id: user_id } });
    return a;
  },

  removeAssignment: async (id, actor) => {
    const a = await UserLocationAssignment.findOne({
      where: { id },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (!a) throw { message: 'Assignment tidak ditemukan', status: 404 };
    await User.update({ work_location_id: null }, { where: { id: a.user_id } });
    await a.destroy();
  },

  // ── Attendances ────────────────────────────────────────────────

  listAttendances: async ({ user_id, date, month, year, status, page, limit } = {}, actor) => {
    const where = {};
    if (user_id) where.user_id = user_id;
    if (date) {
      where.attendance_date = date;
    } else if (month && year) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay   = new Date(y, m, 0).getDate(); // last day of month
      const endDate   = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      where.attendance_date = { [Op.between]: [startDate, endDate] };
    }
    if (status) where.status = status;

    // Allow up to 500 records for monthly recap
    const capLimit = parseInt(limit, 10) > 0 ? Math.min(parseInt(limit, 10), 500) : 20;
    const offset   = ((parseInt(page, 10) || 1) - 1) * capLimit;

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [
        { model: User,         as: 'user',     attributes: ['id', 'name', 'email'], where: withTenantWhere({}, actor), required: true },
        { model: WorkLocation, as: 'location', attributes: ['id', 'name'], required: false },
      ],
      order: [['attendance_date', 'DESC'], ['clock_in', 'DESC']],
      limit: capLimit,
      offset,
    });
    return { data: rows, pagination: mkPagination(count, page, capLimit) };
  },

  getMyAttendances: async (userId, actor) => Attendance.findAll({
    where: { user_id: userId },
    include: [{ model: WorkLocation, as: 'location', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: false }],
    order: [['attendance_date', 'DESC']],
    limit: 30,
  }),

  clockIn: async (userId, payload = {}, actor) => {
    const lat = Number(payload?.lat);
    const lng = Number(payload?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw { message: 'Koordinat lat/lng wajib diisi', status: 400 };
    }
    const today = new Date().toISOString().slice(0, 10);

    // Cek apakah sudah clock-in hari ini
    const existing = await Attendance.findOne({
      where: { user_id: userId, attendance_date: today },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (existing) throw { message: 'Anda sudah clock-in hari ini', status: 400 };

    // Cek apakah user punya assignment lokasi
    const assignment = await UserLocationAssignment.findOne({
      where: { user_id: userId },
      include: [{ model: WorkLocation, as: 'location', where: withTenantWhere({ is_active: true }, actor), required: true }],
    });

    let workLocationId = null;

    if (assignment?.location) {
      // User punya lokasi yang ditugaskan — validasi radius
      const loc = assignment.location;
      const distM = Math.round(haversineKm(lat, lng, parseFloat(loc.latitude), parseFloat(loc.longitude)) * 1000);
      const radius = loc.radius_m ?? 100;
      if (distM > radius) {
        throw {
          message: `Di luar area absensi. Jarak Anda: ${distM}m, radius yang diizinkan: ${radius}m`,
          status: 400,
        };
      }
      workLocationId = loc.id;
    } else {
      // Tidak ada assignment — tolak clock-in
      throw {
        message: 'Anda belum ditugaskan ke lokasi absensi. Hubungi admin untuk mendapatkan penugasan lokasi.',
        status: 400,
      };
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const setting = await getOrCreateAttendanceSettings(actor);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const thresholdMinutes = parseTimeToMinutes(setting.work_start_time) + Number(setting.late_grace_minutes || 0);
    const status = nowMinutes > thresholdMinutes ? 'Terlambat' : 'Hadir';

    return Attendance.create({
      user_id: userId,
      work_location_id: workLocationId,
      attendance_date: today,
      clock_in: time,
      clock_in_lat: lat,
      clock_in_lng: lng,
      status,
    });
  },

  clockOut: async (userId, payload = {}, actor) => {
    const lat = Number(payload?.lat);
    const lng = Number(payload?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw { message: 'Koordinat lat/lng wajib diisi', status: 400 };
    }
    const today = new Date().toISOString().slice(0, 10);
    const att = await Attendance.findOne({
      where: { user_id: userId, attendance_date: today },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (!att) throw { message: 'Belum clock-in hari ini', status: 400 };
    if (att.clock_out) throw { message: 'Sudah clock-out hari ini', status: 400 };

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    await att.update({
      clock_out: time,
      clock_out_lat: lat,
      clock_out_lng: lng,
    });
    return att;
  },

  // ── Leave Requests ─────────────────────────────────────────────

  listLeaveRequests: async ({ page, limit, status, type, user_id, search, start_date, end_date, date } = {}, actor) => {
    // Helper to validate and parse YYYY-MM-DD date format
    const isValidDate = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return false;
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateStr)) return false;
      const d = new Date(dateStr);
      return d instanceof Date && !isNaN(d) && d.toISOString().startsWith(dateStr);
    };

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (user_id) where.user_id = user_id;
    if (date) {
      if (!isValidDate(date)) throw { message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD', status: 400 };
      where.start_date = { [Op.lte]: date };
      where.end_date = { [Op.gte]: date };
    } else {
      if (start_date) {
        if (!isValidDate(start_date)) throw { message: 'Format start_date tidak valid. Gunakan format YYYY-MM-DD', status: 400 };
        where.end_date = { ...(where.end_date || {}), [Op.gte]: start_date };
      }
      if (end_date) {
        if (!isValidDate(end_date)) throw { message: 'Format end_date tidak valid. Gunakan format YYYY-MM-DD', status: 400 };
        where.start_date = { ...(where.start_date || {}), [Op.lte]: end_date };
      }
    }

    const userWhere = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: {
            ...(userWhere || {}),
            ...withTenantWhere({}, actor),
          },
          required: true,
        },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMyLeaveRequests: async (userId, actor) => LeaveRequest.findAll({
    where: { user_id: userId },
    include: [{ model: User, as: 'approver', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  }),

  createLeaveRequest: async (requester, payload, actor) => {
    const isSuperAdmin = requester?.role === 'Super Admin';
    const targetUserId = isSuperAdmin && payload.user_id ? payload.user_id : requester.id;

    const targetUser = await User.findOne({ where: withTenantWhere({ id: targetUserId }, actor) });
    if (!targetUser) throw { message: 'User target lintas perusahaan tidak diizinkan', status: 400 };

    const body = {
      type: payload.type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      reason: payload.reason,
      attachment: payload.attachment,
      user_id: targetUserId,
    };

    if (isSuperAdmin && payload.user_id) {
      body.status = 'Disetujui';
      body.approved_by = requester.id;
      body.approved_at = new Date();
    }

    return LeaveRequest.create(body);
  },

  approveLeaveRequest: async (id, approverId, actor) => {
    const r = await LeaveRequest.findOne({
      where: { id },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    await r.update({ status: 'Disetujui', approved_by: approverId, approved_at: new Date() });
    return r;
  },

  rejectLeaveRequest: async (id, approverId, actor) => {
    const r = await LeaveRequest.findOne({
      where: { id },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    await r.update({ status: 'Ditolak', approved_by: approverId, approved_at: new Date() });
    return r;
  },

  removeLeaveRequest: async (id, userId, actor) => {
    const r = await LeaveRequest.findOne({
      where: { id },
      include: [{ model: User, as: 'user', where: withTenantWhere({}, actor), required: true }],
    });
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    if (r.status !== 'Menunggu') throw { message: 'Hanya pengajuan berstatus Menunggu yang dapat dihapus', status: 400 };
    await r.destroy();
  },
};
