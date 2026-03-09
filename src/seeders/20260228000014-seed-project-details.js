'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder lengkap untuk data detail proyek:
 *  - time_schedule_items (jadwal kerja per unit)
 *  - work_logs           (laporan harian)
 *  - work_log_photos     (foto dokumentasi)
 *  - inventory_logs      (mutasi material)
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    /* ═══════════════════════════════════════
     *  1. Ambil referensi FK dari tabel lain
     * ═══════════════════════════════════════ */

    // Projects
    const [projects] = await queryInterface.sequelize.query(
      `SELECT id, name FROM projects ORDER BY name`
    );
    if (projects.length === 0) {
      console.log('⚠  Tidak ada project, skip seeder project-details.');
      return;
    }

    const P1 = projects.find(p => p.name.includes('Tahap 1'));
    const P2 = projects.find(p => p.name.includes('Tahap 2'));
    if (!P1 || !P2) {
      console.log('⚠  Project Tahap 1/2 tidak ditemukan, skip.');
      return;
    }

    // Project Units (ambil semua, group per project)
    const [allUnits] = await queryInterface.sequelize.query(
      `SELECT id, project_id, no, tipe, progress, status FROM project_units ORDER BY no`
    );
    const p1Units = allUnits.filter(u => u.project_id === P1.id);
    const p2Units = allUnits.filter(u => u.project_id === P2.id);

    // Users (untuk reported_by & created_by)
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users LIMIT 3`
    );
    const USER1 = users[0]?.id || null;
    const USER2 = users[1]?.id || null;
    const USER3 = users[2]?.id || null;

    /* ═══════════════════════════════════════
     *  2. TIME SCHEDULE ITEMS
     * ═══════════════════════════════════════ */
    const activities = [
      { activity: 'Pekerjaan Persiapan & Galian',  bobot: 5,  plan_weeks: 2 },
      { activity: 'Pekerjaan Pondasi',             bobot: 15, plan_weeks: 3 },
      { activity: 'Pekerjaan Struktur Beton',      bobot: 20, plan_weeks: 4 },
      { activity: 'Pekerjaan Dinding & Plester',   bobot: 15, plan_weeks: 3 },
      { activity: 'Pekerjaan Atap & Rangka',       bobot: 10, plan_weeks: 2 },
      { activity: 'Instalasi Listrik',             bobot: 8,  plan_weeks: 2 },
      { activity: 'Instalasi Plumbing',            bobot: 7,  plan_weeks: 2 },
      { activity: 'Pekerjaan Lantai',              bobot: 5,  plan_weeks: 1 },
      { activity: 'Pekerjaan Plafon',              bobot: 5,  plan_weeks: 1 },
      { activity: 'Pekerjaan Finishing & Cat',      bobot: 10, plan_weeks: 2 },
    ];

    const scheduleItems = [];
    const baseDate = new Date('2026-03-01');

    // Generate schedule items for ALL units
    const allProjectUnits = [...p1Units, ...p2Units];
    for (const unit of allProjectUnits) {
      let weekOffset = 0;
      const unitProgress = Number(unit.progress) || 0;

      for (let i = 0; i < activities.length; i++) {
        const act = activities[i];
        const planStart = new Date(baseDate);
        planStart.setDate(planStart.getDate() + weekOffset * 7);
        const planEnd = new Date(planStart);
        planEnd.setDate(planEnd.getDate() + act.plan_weeks * 7);

        // Determine actual progress based on unit progress
        const actThreshold = (i + 1) * 10; // 10, 20, 30... 100
        let actProgress = 0;
        let actualStart = null;
        let actualEnd = null;

        if (unitProgress >= actThreshold) {
          actProgress = 100;
          actualStart = planStart.toISOString().slice(0, 10);
          actualEnd = planEnd.toISOString().slice(0, 10);
        } else if (unitProgress >= actThreshold - 10) {
          actProgress = Math.max(0, Math.min(100, ((unitProgress - (actThreshold - 10)) / 10) * 100));
          actualStart = planStart.toISOString().slice(0, 10);
        }

        // bulan JSON: weekly plan vs actual
        const bulan1 = { minggu1: { plan: act.bobot * 0.25, actual: actProgress >= 25 ? act.bobot * 0.25 : 0 } };
        const bulan2 = { minggu1: { plan: act.bobot * 0.25, actual: actProgress >= 50 ? act.bobot * 0.25 : 0 } };
        const bulan3 = { minggu1: { plan: act.bobot * 0.25, actual: actProgress >= 75 ? act.bobot * 0.25 : 0 } };
        const bulan4 = { minggu1: { plan: act.bobot * 0.25, actual: actProgress >= 100 ? act.bobot * 0.25 : 0 } };

        scheduleItems.push({
          id: uuidv4(),
          ref_type: 'project_unit',
          ref_id: unit.id,
          week_label: `Minggu ${weekOffset + 1}-${weekOffset + act.plan_weeks}`,
          activity: act.activity,
          plan_start: planStart.toISOString().slice(0, 10),
          plan_end: planEnd.toISOString().slice(0, 10),
          actual_start: actualStart,
          actual_end: actualEnd,
          progress: actProgress,
          bobot: act.bobot,
          bulan1: JSON.stringify(bulan1),
          bulan2: JSON.stringify(bulan2),
          bulan3: JSON.stringify(bulan3),
          bulan4: JSON.stringify(bulan4),
          created_at: now,
          updated_at: now,
        });

        weekOffset += act.plan_weeks;
      }
    }

    // Insert in batches (16 units × 10 activities = 160 rows)
    if (scheduleItems.length > 0) {
      await queryInterface.bulkInsert('time_schedule_items', scheduleItems);
      console.log(`✅  ${scheduleItems.length} time_schedule_items seeded`);
    }

    /* ═══════════════════════════════════════
     *  3. WORK LOGS  (laporan harian)
     * ═══════════════════════════════════════ */
    const weatherOptions = ['Cerah', 'Cerah', 'Cerah', 'Mendung', 'Hujan Ringan', 'Hujan'];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const workLogDescriptions = [
      { desc: 'Pengecoran pondasi cakar ayam',        workers: 8 },
      { desc: 'Pemasangan bekisting kolom lantai 1',  workers: 6 },
      { desc: 'Pengecoran sloof dan ring balok',      workers: 10 },
      { desc: 'Pasang bata dinding lantai 1',         workers: 5 },
      { desc: 'Plester dan acian dinding eksterior',   workers: 4 },
      { desc: 'Pemasangan rangka atap baja ringan',   workers: 6 },
      { desc: 'Pemasangan genteng dan nok',           workers: 4 },
      { desc: 'Penarikan kabel listrik & instalasi',  workers: 3 },
      { desc: 'Pemasangan pipa air bersih & kotor',   workers: 3 },
      { desc: 'Pemasangan keramik lantai 60×60',      workers: 4 },
      { desc: 'Pemasangan plafon gypsum',             workers: 3 },
      { desc: 'Pengecatan dinding interior',          workers: 4 },
      { desc: 'Pemasangan kusen aluminium & kaca',    workers: 3 },
      { desc: 'Pemasangan daun pintu & jendela',      workers: 2 },
      { desc: 'Pembersihan akhir & touch-up',         workers: 5 },
    ];

    const workLogs = [];
    const reporterPool = [USER1, USER2, USER3].filter(Boolean);

    // Generate work logs for units with progress > 0
    const activeUnits = allProjectUnits.filter(u => Number(u.progress) > 10);
    for (const unit of activeUnits) {
      const unitProgress = Number(unit.progress);
      // Number of logs proportional to progress
      const logCount = Math.max(2, Math.min(8, Math.floor(unitProgress / 15)));

      for (let i = 0; i < logCount; i++) {
        const daysAgo = logCount - i + Math.floor(Math.random() * 3);
        const workDate = new Date(now);
        workDate.setDate(workDate.getDate() - daysAgo);

        const descIdx = Math.min(i, workLogDescriptions.length - 1);
        const logEntry = workLogDescriptions[descIdx];
        const progressAdded = Math.max(1, Math.min(15, Math.floor(Math.random() * 10) + 2));
        const statusOptions = ['Normal', 'Normal', 'Normal', 'Lembur', 'Kendala'];

        workLogs.push({
          id: uuidv4(),
          project_id: unit.project_id,
          unit_id: unit.id,
          unit_no: unit.no,
          reported_by: reporterPool[i % reporterPool.length] || null,
          date: workDate.toISOString().slice(0, 10),
          activity: `${logEntry.desc}`,
          worker_count: logEntry.workers + Math.floor(Math.random() * 3),
          progress_added: progressAdded,
          status: pick(statusOptions),
          weather: pick(weatherOptions),
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (workLogs.length > 0) {
      await queryInterface.bulkInsert('work_logs', workLogs);
      console.log(`✅  ${workLogs.length} work_logs seeded`);
    }

    /* ═══════════════════════════════════════
     *  4. WORK LOG PHOTOS
     * ═══════════════════════════════════════ */
    const photoUrls = [
      '/uploads/construction/pondasi-01.jpg',
      '/uploads/construction/struktur-01.jpg',
      '/uploads/construction/dinding-01.jpg',
      '/uploads/construction/atap-01.jpg',
      '/uploads/construction/mep-01.jpg',
      '/uploads/construction/finishing-01.jpg',
      '/uploads/construction/progress-01.jpg',
      '/uploads/construction/progress-02.jpg',
    ];

    const captions = [
      'Dokumentasi progres pekerjaan',
      'Foto kondisi lapangan',
      'Hasil pekerjaan hari ini',
      'Inspeksi mandor lapangan',
      'Pengecekan kualitas material',
      'Kondisi cuaca saat pengerjaan',
    ];

    const workLogPhotos = [];
    // Add 1-2 photos per work log
    for (const log of workLogs) {
      const photoCount = 1 + Math.floor(Math.random() * 2); // 1 or 2
      for (let p = 0; p < photoCount; p++) {
        workLogPhotos.push({
          id: uuidv4(),
          work_log_id: log.id,
          photo_url: pick(photoUrls),
          caption: pick(captions),
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (workLogPhotos.length > 0) {
      await queryInterface.bulkInsert('work_log_photos', workLogPhotos);
      console.log(`✅  ${workLogPhotos.length} work_log_photos seeded`);
    }

    /* ═══════════════════════════════════════
     *  5. INVENTORY LOGS  (mutasi material)
     * ═══════════════════════════════════════ */
    const materials = [
      { item: 'Semen Tiga Roda 50kg',     category: 'Bahan Bangunan', unit: 'Sak',    qtyRange: [10, 50] },
      { item: 'Pasir Cor',                 category: 'Bahan Bangunan', unit: 'Kubik',  qtyRange: [2, 8] },
      { item: 'Batu Split 2-3',            category: 'Bahan Bangunan', unit: 'Kubik',  qtyRange: [2, 6] },
      { item: 'Besi Beton 10mm',           category: 'Besi & Baja',   unit: 'Batang', qtyRange: [20, 80] },
      { item: 'Besi Beton 12mm',           category: 'Besi & Baja',   unit: 'Batang', qtyRange: [15, 60] },
      { item: 'Kawat Bendrat',             category: 'Besi & Baja',   unit: 'Kg',     qtyRange: [5, 20] },
      { item: 'Bata Merah Press',          category: 'Bahan Bangunan', unit: 'Buah',   qtyRange: [500, 2000] },
      { item: 'Kayu Kaso 5/7',             category: 'Kayu',          unit: 'Batang', qtyRange: [20, 50] },
      { item: 'Triplek 9mm',              category: 'Kayu',          unit: 'Lembar', qtyRange: [5, 15] },
      { item: 'Pipa PVC 4"',              category: 'Plumbing',      unit: 'Batang', qtyRange: [5, 15] },
      { item: 'Kabel NYM 3×2.5mm',        category: 'Listrik',       unit: 'Meter',  qtyRange: [50, 200] },
      { item: 'Keramik 60×60 Putih',       category: 'Finishing',     unit: 'Dus',    qtyRange: [10, 30] },
      { item: 'Cat Tembok 25kg Putih',     category: 'Finishing',     unit: 'Pail',   qtyRange: [3, 10] },
      { item: 'Genteng Beton Flat',        category: 'Atap',          unit: 'Buah',   qtyRange: [100, 400] },
      { item: 'Baja Ringan C75',           category: 'Atap',          unit: 'Batang', qtyRange: [15, 40] },
    ];

    const inventoryLogs = [];

    // Generate masuk (incoming) logs for both projects  
    for (const proj of [P1, P2]) {
      const projUnits = proj.id === P1.id ? p1Units : p2Units;
      const daysSpread = proj.id === P1.id ? 60 : 30; // P1 lebih lama

      // Material masuk (8–12 entries per project)
      const masukCount = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < masukCount; i++) {
        const mat = materials[i % materials.length];
        const daysAgo = Math.floor(Math.random() * daysSpread) + 1;
        const logDate = new Date(now);
        logDate.setDate(logDate.getDate() - daysAgo);
        const qty = mat.qtyRange[0] + Math.floor(Math.random() * (mat.qtyRange[1] - mat.qtyRange[0]));
        const targetUnit = projUnits[i % projUnits.length];
        const dateStr = logDate.toISOString().slice(0, 10);

        inventoryLogs.push({
          id: uuidv4(),
          project_id: proj.id,
          item_name: mat.item,
          item: mat.item,
          category: mat.category,
          unit: mat.unit,
          unit_satuan: mat.unit,
          unit_no: targetUnit?.no || 'main',
          qty_in: qty,
          qty_out: 0,
          qty: qty,
          qty_balance: qty,
          type: 'in',
          notes: `Pengiriman ${mat.item} oleh supplier`,
          log_date: dateStr,
          date: dateStr,
          person: 'Admin Logistik',
          created_by: USER1,
          created_at: now,
          updated_at: now,
        });
      }

      // Material keluar (5–8 entries per project)
      const keluarCount = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < keluarCount; i++) {
        const mat = materials[i % materials.length];
        const daysAgo = Math.floor(Math.random() * (daysSpread - 5)) + 1;
        const logDate = new Date(now);
        logDate.setDate(logDate.getDate() - daysAgo);
        const qty = Math.floor(mat.qtyRange[0] * 0.6) + Math.floor(Math.random() * mat.qtyRange[0]);
        const targetUnit = projUnits[i % projUnits.length];
        const dateStr = logDate.toISOString().slice(0, 10);

        inventoryLogs.push({
          id: uuidv4(),
          project_id: proj.id,
          item_name: mat.item,
          item: mat.item,
          category: mat.category,
          unit: mat.unit,
          unit_satuan: mat.unit,
          unit_no: targetUnit?.no || 'main',
          qty_in: 0,
          qty_out: qty,
          qty: qty,
          qty_balance: -qty,
          type: 'out',
          notes: `Dipakai untuk unit ${targetUnit?.no || 'umum'}`,
          log_date: dateStr,
          date: dateStr,
          person: 'Mandor Lapangan',
          created_by: USER2 || USER1,
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (inventoryLogs.length > 0) {
      await queryInterface.bulkInsert('inventory_logs', inventoryLogs);
      console.log(`✅  ${inventoryLogs.length} inventory_logs seeded`);
    }

    console.log('✅  Seeder project-details selesai!');
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');

    // Get project IDs
    const [projects] = await queryInterface.sequelize.query(
      `SELECT id FROM projects WHERE name LIKE '%Maisa Primeris%'`
    );
    const projectIds = projects.map(p => p.id);

    if (projectIds.length === 0) return;

    // Get unit IDs for these projects
    const [units] = await queryInterface.sequelize.query(
      `SELECT id FROM project_units WHERE project_id IN (${projectIds.map(id => `'${id}'`).join(',')})`
    );
    const unitIds = units.map(u => u.id);

    // Delete in reverse FK order

    // 4. work_log_photos (via work_logs)
    if (projectIds.length > 0) {
      const [wlogs] = await queryInterface.sequelize.query(
        `SELECT id FROM work_logs WHERE project_id IN (${projectIds.map(id => `'${id}'`).join(',')})`
      );
      if (wlogs.length > 0) {
        await queryInterface.bulkDelete('work_log_photos', {
          work_log_id: { [Op.in]: wlogs.map(w => w.id) },
        });
      }
    }

    // 3. work_logs
    await queryInterface.bulkDelete('work_logs', {
      project_id: { [Op.in]: projectIds },
    });

    // 2. inventory_logs
    await queryInterface.bulkDelete('inventory_logs', {
      project_id: { [Op.in]: projectIds },
    });

    // 1. time_schedule_items (ref_id = unit_id)
    if (unitIds.length > 0) {
      await queryInterface.bulkDelete('time_schedule_items', {
        ref_id: { [Op.in]: unitIds },
      });
    }

    console.log('🗑  Seeder project-details di-undo.');
  },
};
