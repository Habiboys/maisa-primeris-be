'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Absensi & Leave Requests
 *
 * Mengambil user_id dan work_location_id dari data yang sudah ada.
 *
 * Cara jalankan:
 *   npx sequelize-cli db:seed --seed 20260228000013-seed-attendance-data.js
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ═══════════════════════════════════════════════════════════
    // Ambil referensi dari tabel yang sudah ada
    // ═══════════════════════════════════════════════════════════
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users ORDER BY created_at LIMIT 5`
    );
    const [locations] = await queryInterface.sequelize.query(
      `SELECT id, name FROM work_locations WHERE is_active = true ORDER BY created_at LIMIT 3`
    );

    if (users.length < 2 || locations.length < 1) {
      console.log('⚠️  Skipping attendance seeder — belum cukup users / work_locations.');
      return;
    }

    const U1 = users[0].id;
    const U2 = users[1].id;
    const U3 = users.length > 2 ? users[2].id : null;

    const L1 = locations[0].id;
    const L2 = locations.length > 1 ? locations[1].id : L1;

    // ═══════════════════════════════════════════════════════════
    // 1. ATTENDANCES — 3 hari, menggunakan user yang tersedia
    //    Unique constraint: (user_id, attendance_date)
    // ═══════════════════════════════════════════════════════════
    const attendances = [
      // ── Hari 1: 2026-03-03 ────────────────────────────────
      { id: uuidv4(), user_id: U1, work_location_id: L1, attendance_date: '2026-03-03', clock_in: '07:55:00', clock_out: '17:05:00', clock_in_lat: -6.2089, clock_in_lng: 106.8457, clock_out_lat: -6.2088, clock_out_lng: 106.8456, clock_in_photo: null, clock_out_photo: null, status: 'Hadir', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: U2, work_location_id: L1, attendance_date: '2026-03-03', clock_in: '08:15:00', clock_out: '17:10:00', clock_in_lat: -6.2090, clock_in_lng: 106.8458, clock_out_lat: -6.2088, clock_out_lng: 106.8456, clock_in_photo: null, clock_out_photo: null, status: 'Terlambat', notes: 'Terlambat 15 menit karena macet.', created_at: now, updated_at: now },
      // ── Hari 2: 2026-03-04 ────────────────────────────────
      { id: uuidv4(), user_id: U1, work_location_id: L1, attendance_date: '2026-03-04', clock_in: '07:58:00', clock_out: '17:02:00', clock_in_lat: -6.2088, clock_in_lng: 106.8456, clock_out_lat: -6.2089, clock_out_lng: 106.8457, clock_in_photo: null, clock_out_photo: null, status: 'Hadir', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: U2, work_location_id: L1, attendance_date: '2026-03-04', clock_in: '07:59:00', clock_out: '17:00:00', clock_in_lat: -6.2088, clock_in_lng: 106.8456, clock_out_lat: -6.2088, clock_out_lng: 106.8456, clock_in_photo: null, clock_out_photo: null, status: 'Hadir', notes: null, created_at: now, updated_at: now },
      // ── Hari 3: 2026-03-05 ────────────────────────────────
      { id: uuidv4(), user_id: U1, work_location_id: L1, attendance_date: '2026-03-05', clock_in: null, clock_out: null, clock_in_lat: null, clock_in_lng: null, clock_out_lat: null, clock_out_lng: null, clock_in_photo: null, clock_out_photo: null, status: 'Sakit', notes: 'Sakit demam, sudah kirim surat dokter.', created_at: now, updated_at: now },
      { id: uuidv4(), user_id: U2, work_location_id: L2, attendance_date: '2026-03-05', clock_in: '08:05:00', clock_out: '17:00:00', clock_in_lat: -6.5972, clock_in_lng: 106.8061, clock_out_lat: -6.5971, clock_out_lng: 106.8060, clock_in_photo: null, clock_out_photo: null, status: 'Terlambat', notes: 'Terlambat 5 menit.', created_at: now, updated_at: now },
    ];

    // Tambah data untuk U3 jika ada user ke-3
    if (U3) {
      attendances.push(
        { id: uuidv4(), user_id: U3, work_location_id: L2, attendance_date: '2026-03-03', clock_in: '07:45:00', clock_out: '17:00:00', clock_in_lat: -6.5972, clock_in_lng: 106.8061, clock_out_lat: -6.5971, clock_out_lng: 106.8060, clock_in_photo: null, clock_out_photo: null, status: 'Hadir', notes: null, created_at: now, updated_at: now },
        { id: uuidv4(), user_id: U3, work_location_id: L2, attendance_date: '2026-03-04', clock_in: '08:10:00', clock_out: '17:15:00', clock_in_lat: -6.5972, clock_in_lng: 106.8061, clock_out_lat: -6.5971, clock_out_lng: 106.8060, clock_in_photo: null, clock_out_photo: null, status: 'Terlambat', notes: 'Terlambat 10 menit.', created_at: now, updated_at: now },
        { id: uuidv4(), user_id: U3, work_location_id: L2, attendance_date: '2026-03-05', clock_in: null, clock_out: null, clock_in_lat: null, clock_in_lng: null, clock_out_lat: null, clock_out_lng: null, clock_in_photo: null, clock_out_photo: null, status: 'Alpha', notes: 'Tidak hadir tanpa keterangan.', created_at: now, updated_at: now },
      );
    }

    await queryInterface.bulkInsert('attendances', attendances, {});

    // ═══════════════════════════════════════════════════════════
    // 2. LEAVE REQUESTS
    // ═══════════════════════════════════════════════════════════
    const leaveRequests = [
      {
        id: uuidv4(),
        user_id: U2,
        type: 'Cuti',
        start_date: '2026-03-10',
        end_date: '2026-03-14',
        reason: 'Cuti tahunan untuk liburan keluarga.',
        attachment: null,
        status: 'Disetujui',
        approved_by: U1,
        approved_at: new Date('2026-03-05T10:00:00Z'),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: U1,
        type: 'Sakit',
        start_date: '2026-03-05',
        end_date: '2026-03-06',
        reason: 'Demam tinggi, rujukan dokter untuk istirahat.',
        attachment: null,
        status: 'Disetujui',
        approved_by: U2,
        approved_at: new Date('2026-03-05T09:00:00Z'),
        created_at: now,
        updated_at: now,
      },
    ];

    // Tambah leave requests untuk U3 jika ada
    if (U3) {
      leaveRequests.push(
        {
          id: uuidv4(),
          user_id: U3,
          type: 'Izin',
          start_date: '2026-03-20',
          end_date: '2026-03-20',
          reason: 'Izin mengurus perpanjangan SIM.',
          attachment: null,
          status: 'Menunggu',
          approved_by: null,
          approved_at: null,
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          user_id: U3,
          type: 'Cuti',
          start_date: '2026-04-01',
          end_date: '2026-04-03',
          reason: 'Cuti untuk acara pernikahan saudara.',
          attachment: null,
          status: 'Ditolak',
          approved_by: U1,
          approved_at: new Date('2026-03-05T11:00:00Z'),
          created_at: now,
          updated_at: now,
        },
      );
    }

    await queryInterface.bulkInsert('leave_requests', leaveRequests, {});

    const attCount = attendances.length;
    const leaveCount = leaveRequests.length;
    console.log(`✅  Attendance data seeded: ${attCount} attendances, ${leaveCount} leave requests`);
  },

  async down(queryInterface) {
    const Op = require('sequelize').Op;

    await queryInterface.bulkDelete('leave_requests', {
      reason: {
        [Op.in]: [
          'Cuti tahunan untuk liburan keluarga.',
          'Demam tinggi, rujukan dokter untuk istirahat.',
          'Izin mengurus perpanjangan SIM.',
          'Cuti untuk acara pernikahan saudara.',
        ],
      },
    }, {});

    await queryInterface.bulkDelete('attendances', {
      attendance_date: {
        [Op.in]: ['2026-03-03', '2026-03-04', '2026-03-05'],
      },
    }, {});
  },
};
