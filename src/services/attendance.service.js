'use strict';

const { Op, fn, col, literal } = require('sequelize');
const {
  WorkLocation, UserLocationAssignment, Attendance, LeaveRequest, User,
} = require('../models');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
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
  // ── Work Locations ─────────────────────────────────────────────

  listLocations: async () => WorkLocation.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),

  getLocationById: async (id) => {
    const l = await WorkLocation.findByPk(id);
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    return l;
  },

  createLocation: async (payload) => WorkLocation.create(payload),

  updateLocation: async (id, payload) => {
    const l = await WorkLocation.findByPk(id);
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    await l.update(payload);
    return l;
  },

  removeLocation: async (id) => {
    const l = await WorkLocation.findByPk(id);
    if (!l) throw { message: 'Lokasi tidak ditemukan', status: 404 };
    await l.update({ is_active: false }); // soft delete
  },

  // ── User-Location Assignments ──────────────────────────────────

  listAssignments: async () => UserLocationAssignment.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
      { model: WorkLocation, as: 'location', attributes: ['id', 'name', 'address'] },
    ],
    order: [['created_at', 'DESC']],
  }),

  createAssignment: async ({ user_id, work_location_id }) => {
    // Remove previous assignment for this user first (one-to-one)
    await UserLocationAssignment.destroy({ where: { user_id } });
    const a = await UserLocationAssignment.create({ user_id, work_location_id });
    await User.update({ work_location_id }, { where: { id: user_id } });
    return a;
  },

  removeAssignment: async (id) => {
    const a = await UserLocationAssignment.findByPk(id);
    if (!a) throw { message: 'Assignment tidak ditemukan', status: 404 };
    await User.update({ work_location_id: null }, { where: { id: a.user_id } });
    await a.destroy();
  },

  // ── Attendances ────────────────────────────────────────────────

  listAttendances: async ({ user_id, date, month, year, status, page, limit } = {}) => {
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
        { model: User,         as: 'user',     attributes: ['id', 'name', 'email'] },
        { model: WorkLocation, as: 'location', attributes: ['id', 'name'] },
      ],
      order: [['attendance_date', 'DESC'], ['clock_in', 'DESC']],
      limit: capLimit,
      offset,
    });
    return { data: rows, pagination: mkPagination(count, page, capLimit) };
  },

  getMyAttendances: async (userId) => Attendance.findAll({
    where: { user_id: userId },
    include: [{ model: WorkLocation, as: 'location', attributes: ['id', 'name'] }],
    order: [['attendance_date', 'DESC']],
    limit: 30,
  }),

  clockIn: async (userId, { lat, lng }) => {
    const today = new Date().toISOString().slice(0, 10);

    // Cek apakah sudah clock-in hari ini
    const existing = await Attendance.findOne({ where: { user_id: userId, attendance_date: today } });
    if (existing) throw { message: 'Anda sudah clock-in hari ini', status: 400 };

    // Cek apakah user punya assignment lokasi
    const assignment = await UserLocationAssignment.findOne({
      where: { user_id: userId },
      include: [{ model: WorkLocation, as: 'location', where: { is_active: true } }],
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
    const status = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0) ? 'Terlambat' : 'Hadir';

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

  clockOut: async (userId, { lat, lng }) => {
    const today = new Date().toISOString().slice(0, 10);
    const att = await Attendance.findOne({ where: { user_id: userId, attendance_date: today } });
    if (!att) throw { message: 'Belum clock-in hari ini', status: 400 };
    if (att.clock_out) throw { message: 'Sudah clock-out hari ini', status: 400 };

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    await att.update({ clock_out: time, clock_out_lat: lat, clock_out_lng: lng });
    return att;
  },

  // ── Leave Requests ─────────────────────────────────────────────

  listLeaveRequests: async ({ page, limit } = {}) => {
    const { count, rows } = await LeaveRequest.findAndCountAll({
      include: [
        { model: User, as: 'user',     attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMyLeaveRequests: async (userId) => LeaveRequest.findAll({
    where: { user_id: userId },
    include: [{ model: User, as: 'approver', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  }),

  createLeaveRequest: async (userId, payload) => LeaveRequest.create({ ...payload, user_id: userId }),

  approveLeaveRequest: async (id, approverId) => {
    const r = await LeaveRequest.findByPk(id);
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    await r.update({ status: 'Disetujui', approved_by: approverId, approved_at: new Date() });
    return r;
  },

  rejectLeaveRequest: async (id, approverId) => {
    const r = await LeaveRequest.findByPk(id);
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    await r.update({ status: 'Ditolak', approved_by: approverId, approved_at: new Date() });
    return r;
  },

  removeLeaveRequest: async (id, userId) => {
    const r = await LeaveRequest.findByPk(id);
    if (!r) throw { message: 'Pengajuan tidak ditemukan', status: 404 };
    if (r.status !== 'Menunggu') throw { message: 'Hanya pengajuan berstatus Menunggu yang dapat dihapus', status: 400 };
    await r.destroy();
  },
};
