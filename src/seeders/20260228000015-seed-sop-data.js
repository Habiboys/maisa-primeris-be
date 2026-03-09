'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ── Lookup: users & projects ────────────────────────────────
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users ORDER BY name`
    );
    if (users.length === 0) {
      console.log('⚠  Tidak ada user, skip seeder SOP.');
      return;
    }

    const [projects] = await queryInterface.sequelize.query(
      `SELECT id, name FROM projects ORDER BY name LIMIT 2`
    );
    if (projects.length === 0) {
      console.log('⚠  Tidak ada project, skip seeder SOP.');
      return;
    }

    const U1 = users[0]; // first user (Super Admin typically)
    const U2 = users.length > 1 ? users[1] : users[0];
    const U3 = users.length > 2 ? users[2] : users[0];
    const P1 = projects[0];
    const P2 = projects.length > 1 ? projects[1] : projects[0];
    const now = new Date();

    // ════════════════════════════════════════════════════════════
    // 1. PERMINTAAN MATERIAL  (6 records + items)
    // ════════════════════════════════════════════════════════════
    const pm1 = uuidv4(), pm2 = uuidv4(), pm3 = uuidv4(),
          pm4 = uuidv4(), pm5 = uuidv4(), pm6 = uuidv4();

    await queryInterface.bulkInsert('permintaan_material', [
      { id: pm1, nomor: 'PM-2026-001', project_id: P1.id, requested_by: U1.id, request_date: '2026-02-05', status: 'Disetujui', notes: 'Kebutuhan cor lantai unit A1-A5', created_at: now, updated_at: now },
      { id: pm2, nomor: 'PM-2026-002', project_id: P1.id, requested_by: U2.id, request_date: '2026-02-08', status: 'Diajukan', notes: 'Material finishing cluster A', created_at: now, updated_at: now },
      { id: pm3, nomor: 'PM-2026-003', project_id: P2.id, requested_by: U1.id, request_date: '2026-02-10', status: 'Ditolak', notes: 'Stok masih mencukupi', created_at: now, updated_at: now },
      { id: pm4, nomor: 'PM-2026-004', project_id: P1.id, requested_by: U3.id, request_date: '2026-02-12', status: 'Disetujui', notes: 'Atap unit B1-B4', created_at: now, updated_at: now },
      { id: pm5, nomor: 'PM-2026-005', project_id: P2.id, requested_by: U2.id, request_date: '2026-02-14', status: 'Draft', notes: 'Belum final', created_at: now, updated_at: now },
      { id: pm6, nomor: 'PM-2026-006', project_id: P1.id, requested_by: U1.id, request_date: '2026-02-15', status: 'Selesai', notes: 'Material sudah diterima semua', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('permintaan_material_items', [
      // PM-001
      { id: uuidv4(), permintaan_material_id: pm1, item_name: 'Semen Gresik 40kg', unit: 'Sak', qty_requested: 100, qty_approved: 100, notes: 'Cor lantai', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm1, item_name: 'Pasir Pasang', unit: 'M3', qty_requested: 10, qty_approved: 10, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm1, item_name: 'Besi Beton 10mm', unit: 'Batang', qty_requested: 200, qty_approved: 200, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm1, item_name: 'Kawat Bendrat', unit: 'Kg', qty_requested: 25, qty_approved: 25, notes: '', created_at: now, updated_at: now },
      // PM-002
      { id: uuidv4(), permintaan_material_id: pm2, item_name: 'Cat Tembok Putih', unit: 'Kaleng 5kg', qty_requested: 30, qty_approved: null, notes: 'Finishing', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm2, item_name: 'Kuas Cat 3 inch', unit: 'Pcs', qty_requested: 15, qty_approved: null, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm2, item_name: 'Plamir Tembok', unit: 'Kg', qty_requested: 50, qty_approved: null, notes: '', created_at: now, updated_at: now },
      // PM-003
      { id: uuidv4(), permintaan_material_id: pm3, item_name: 'Keramik 40x40 Putih', unit: 'Dus', qty_requested: 80, qty_approved: null, notes: 'Ditolak - stok cukup', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm3, item_name: 'Semen Nat Putih', unit: 'Kg', qty_requested: 40, qty_approved: null, notes: '', created_at: now, updated_at: now },
      // PM-004
      { id: uuidv4(), permintaan_material_id: pm4, item_name: 'Genteng Keramik', unit: 'Buah', qty_requested: 500, qty_approved: 500, notes: 'Atap unit B', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm4, item_name: 'Kayu Reng 3/4', unit: 'Batang', qty_requested: 100, qty_approved: 100, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm4, item_name: 'Paku Reng', unit: 'Kg', qty_requested: 10, qty_approved: 10, notes: '', created_at: now, updated_at: now },
      // PM-005
      { id: uuidv4(), permintaan_material_id: pm5, item_name: 'Pipa PVC 4 inch', unit: 'Batang', qty_requested: 20, qty_approved: null, notes: 'Draft', created_at: now, updated_at: now },
      // PM-006
      { id: uuidv4(), permintaan_material_id: pm6, item_name: 'Batu Bata Merah', unit: 'Buah', qty_requested: 5000, qty_approved: 5000, notes: 'Selesai', created_at: now, updated_at: now },
      { id: uuidv4(), permintaan_material_id: pm6, item_name: 'Semen Tiga Roda 50kg', unit: 'Sak', qty_requested: 80, qty_approved: 80, notes: '', created_at: now, updated_at: now },
    ]);

    console.log('✅  permintaan_material: 6 records + 15 items');

    // ════════════════════════════════════════════════════════════
    // 2. TANDA TERIMA GUDANG  (5 records + items)
    // ════════════════════════════════════════════════════════════
    const ttg1 = uuidv4(), ttg2 = uuidv4(), ttg3 = uuidv4(),
          ttg4 = uuidv4(), ttg5 = uuidv4();

    await queryInterface.bulkInsert('tanda_terima_gudang', [
      { id: ttg1, nomor: 'TTG-2026-001', project_id: P1.id, received_by: U1.id, receive_date: '2026-02-06', supplier: 'CV Sumber Rejeki', status: 'Selesai', notes: 'Pesanan PM-001', created_at: now, updated_at: now },
      { id: ttg2, nomor: 'TTG-2026-002', project_id: P1.id, received_by: U2.id, receive_date: '2026-02-09', supplier: 'PT Baja Perkasa', status: 'Selesai', notes: 'Besi untuk pondasi', created_at: now, updated_at: now },
      { id: ttg3, nomor: 'TTG-2026-003', project_id: P2.id, received_by: U1.id, receive_date: '2026-02-11', supplier: 'UD Mandiri Jaya', status: 'Draft', notes: 'Belum diverifikasi', created_at: now, updated_at: now },
      { id: ttg4, nomor: 'TTG-2026-004', project_id: P1.id, received_by: U3.id, receive_date: '2026-02-13', supplier: 'CV Sumber Rejeki', status: 'Selesai', notes: 'Pesanan PM-004', created_at: now, updated_at: now },
      { id: ttg5, nomor: 'TTG-2026-005', project_id: P2.id, received_by: U2.id, receive_date: '2026-02-15', supplier: 'PT Sinar Mas', status: 'Draft', notes: 'Material baru datang', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('tanda_terima_gudang_items', [
      // TTG-001
      { id: uuidv4(), tanda_terima_gudang_id: ttg1, item_name: 'Semen Gresik 40kg', unit: 'Sak', qty_ordered: 100, qty_received: 100, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg1, item_name: 'Pasir Pasang', unit: 'M3', qty_ordered: 10, qty_received: 10, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg1, item_name: 'Kawat Bendrat', unit: 'Kg', qty_ordered: 25, qty_received: 24, condition: 'Baik', notes: 'Kurang 1 kg', created_at: now, updated_at: now },
      // TTG-002
      { id: uuidv4(), tanda_terima_gudang_id: ttg2, item_name: 'Besi Beton 10mm', unit: 'Batang', qty_ordered: 200, qty_received: 200, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg2, item_name: 'Besi Beton 12mm', unit: 'Batang', qty_ordered: 100, qty_received: 98, condition: 'Baik', notes: '2 batang rusak', created_at: now, updated_at: now },
      // TTG-003
      { id: uuidv4(), tanda_terima_gudang_id: ttg3, item_name: 'Keramik 40x40 Putih', unit: 'Dus', qty_ordered: 60, qty_received: 60, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg3, item_name: 'Keramik 30x30 Abu', unit: 'Dus', qty_ordered: 40, qty_received: 38, condition: 'Rusak', notes: '2 dus pecah', created_at: now, updated_at: now },
      // TTG-004
      { id: uuidv4(), tanda_terima_gudang_id: ttg4, item_name: 'Genteng Keramik', unit: 'Buah', qty_ordered: 500, qty_received: 500, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg4, item_name: 'Kayu Reng 3/4', unit: 'Batang', qty_ordered: 100, qty_received: 100, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      // TTG-005
      { id: uuidv4(), tanda_terima_gudang_id: ttg5, item_name: 'Cat Tembok Putih', unit: 'Kaleng 5kg', qty_ordered: 30, qty_received: 30, condition: 'Baik', notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), tanda_terima_gudang_id: ttg5, item_name: 'Plamir Tembok', unit: 'Kg', qty_ordered: 50, qty_received: 50, condition: 'Baik', notes: '', created_at: now, updated_at: now },
    ]);

    console.log('✅  tanda_terima_gudang: 5 records + 11 items');

    // ════════════════════════════════════════════════════════════
    // 3. BARANG KELUAR  (5 records + items)
    // ════════════════════════════════════════════════════════════
    const bk1 = uuidv4(), bk2 = uuidv4(), bk3 = uuidv4(),
          bk4 = uuidv4(), bk5 = uuidv4();

    await queryInterface.bulkInsert('barang_keluar', [
      { id: bk1, nomor: 'BK-2026-001', project_id: P1.id, issued_by: U1.id, issue_date: '2026-02-07', received_by: 'Bambang Sutejo', status: 'Selesai', notes: 'Material cor unit A1-A3', created_at: now, updated_at: now },
      { id: bk2, nomor: 'BK-2026-002', project_id: P1.id, issued_by: U2.id, issue_date: '2026-02-10', received_by: 'Agus Wirawan', status: 'Selesai', notes: 'Besi pondasi unit A4-A5', created_at: now, updated_at: now },
      { id: bk3, nomor: 'BK-2026-003', project_id: P2.id, issued_by: U1.id, issue_date: '2026-02-12', received_by: 'Joko Susilo', status: 'Draft', notes: 'Keramik lantai', created_at: now, updated_at: now },
      { id: bk4, nomor: 'BK-2026-004', project_id: P1.id, issued_by: U3.id, issue_date: '2026-02-14', received_by: 'Bambang Sutejo', status: 'Selesai', notes: 'Genteng unit B1-B4', created_at: now, updated_at: now },
      { id: bk5, nomor: 'BK-2026-005', project_id: P2.id, issued_by: U1.id, issue_date: '2026-02-16', received_by: 'Rina Wati', status: 'Draft', notes: 'Cat finishing', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('barang_keluar_items', [
      // BK-001
      { id: uuidv4(), barang_keluar_id: bk1, item_name: 'Semen Gresik 40kg', unit: 'Sak', qty: 50, notes: 'Unit A1-A3', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk1, item_name: 'Pasir Pasang', unit: 'M3', qty: 5, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk1, item_name: 'Kawat Bendrat', unit: 'Kg', qty: 10, notes: '', created_at: now, updated_at: now },
      // BK-002
      { id: uuidv4(), barang_keluar_id: bk2, item_name: 'Besi Beton 10mm', unit: 'Batang', qty: 100, notes: 'Pondasi unit A4-A5', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk2, item_name: 'Besi Beton 12mm', unit: 'Batang', qty: 50, notes: '', created_at: now, updated_at: now },
      // BK-003
      { id: uuidv4(), barang_keluar_id: bk3, item_name: 'Keramik 40x40 Putih', unit: 'Dus', qty: 30, notes: 'Lantai cluster B', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk3, item_name: 'Semen Nat Putih', unit: 'Kg', qty: 20, notes: '', created_at: now, updated_at: now },
      // BK-004
      { id: uuidv4(), barang_keluar_id: bk4, item_name: 'Genteng Keramik', unit: 'Buah', qty: 250, notes: 'Unit B1-B2', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk4, item_name: 'Kayu Reng 3/4', unit: 'Batang', qty: 50, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk4, item_name: 'Paku Reng', unit: 'Kg', qty: 5, notes: '', created_at: now, updated_at: now },
      // BK-005
      { id: uuidv4(), barang_keluar_id: bk5, item_name: 'Cat Tembok Putih', unit: 'Kaleng 5kg', qty: 15, notes: 'Finishing cluster B', created_at: now, updated_at: now },
      { id: uuidv4(), barang_keluar_id: bk5, item_name: 'Kuas Cat 3 inch', unit: 'Pcs', qty: 8, notes: '', created_at: now, updated_at: now },
    ]);

    console.log('✅  barang_keluar: 5 records + 12 items');

    // ════════════════════════════════════════════════════════════
    // 4. INVENTARIS LAPANGAN  (10 records)
    // ════════════════════════════════════════════════════════════
    await queryInterface.bulkInsert('inventaris_lapangan', [
      { id: uuidv4(), project_id: P1.id, item_name: 'Concrete Mixer / Molen', category: 'Alat Berat', unit: 'Unit', qty: 2, condition: 'Baik', location: 'Site Cluster A', last_check: '2026-02-05', notes: 'Beroperasi normal', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P1.id, item_name: 'Scaffolding Set H=1.7m', category: 'Alat Bantu', unit: 'Set', qty: 10, condition: 'Baik', location: 'Gudang Utama', last_check: '2026-02-05', notes: '', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P1.id, item_name: 'Generator 5000W Honda', category: 'Alat Listrik', unit: 'Unit', qty: 1, condition: 'Rusak Ringan', location: 'Site Cluster A', last_check: '2026-02-08', notes: 'Kabel starter perlu diganti', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P2.id, item_name: 'Vibrator Beton', category: 'Alat Berat', unit: 'Unit', qty: 1, condition: 'Baik', location: 'Site Cluster B', last_check: '2026-02-10', notes: '', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P1.id, item_name: 'Waterpass Digital', category: 'Alat Ukur', unit: 'Unit', qty: 3, condition: 'Baik', location: 'Gudang Utama', last_check: '2026-02-10', notes: 'Kalibrasi terakhir Jan 2026', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P2.id, item_name: 'Theodolite Topcon', category: 'Alat Ukur', unit: 'Unit', qty: 1, condition: 'Baik', location: 'Gudang Utama', last_check: '2026-02-12', notes: 'Perawatan berkala', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P1.id, item_name: 'Mesin Potong Keramik', category: 'Alat Potong', unit: 'Unit', qty: 2, condition: 'Baik', location: 'Site Cluster A', last_check: '2026-02-13', notes: '', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P2.id, item_name: 'Kompresor Udara 1 HP', category: 'Alat Pneumatik', unit: 'Unit', qty: 1, condition: 'Rusak Berat', location: 'Gudang Utama', last_check: '2026-02-14', notes: 'Motor terbakar, perlu ganti', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P1.id, item_name: 'Gerobak Sorong', category: 'Alat Bantu', unit: 'Unit', qty: 5, condition: 'Baik', location: 'Site Cluster A', last_check: '2026-02-14', notes: '', photo_url: null, created_at: now, updated_at: now },
      { id: uuidv4(), project_id: P2.id, item_name: 'Tangga Aluminium 4m', category: 'Alat Bantu', unit: 'Unit', qty: 3, condition: 'Rusak Ringan', location: 'Site Cluster B', last_check: '2026-02-15', notes: '1 unit kunci retak', photo_url: null, created_at: now, updated_at: now },
    ]);

    console.log('✅  inventaris_lapangan: 10 records');

    // ════════════════════════════════════════════════════════════
    // 5. SURAT JALAN  (5 records + items)
    // ════════════════════════════════════════════════════════════
    const sj1 = uuidv4(), sj2 = uuidv4(), sj3 = uuidv4(),
          sj4 = uuidv4(), sj5 = uuidv4();

    await queryInterface.bulkInsert('surat_jalan', [
      { id: sj1, nomor: 'SJ-2026-001', project_id: P1.id, driver_name: 'Eko Prasetyo', vehicle_no: 'L 1234 AB', send_date: '2026-02-07', destination: 'Site Cluster A', issued_by: U1.id, status: 'Diterima', notes: 'Material cor lantai', created_at: now, updated_at: now },
      { id: sj2, nomor: 'SJ-2026-002', project_id: P1.id, driver_name: 'Budi Hartono', vehicle_no: 'L 5678 CD', send_date: '2026-02-10', destination: 'Site Cluster A', issued_by: U2.id, status: 'Diterima', notes: 'Besi pondasi', created_at: now, updated_at: now },
      { id: sj3, nomor: 'SJ-2026-003', project_id: P2.id, driver_name: 'Eko Prasetyo', vehicle_no: 'L 1234 AB', send_date: '2026-02-12', destination: 'Site Cluster B', issued_by: U1.id, status: 'Dikirim', notes: 'Keramik lantai', created_at: now, updated_at: now },
      { id: sj4, nomor: 'SJ-2026-004', project_id: P1.id, driver_name: 'Surya Adi', vehicle_no: 'L 9012 EF', send_date: '2026-02-14', destination: 'Site Cluster A', issued_by: U3.id, status: 'Diterima', notes: 'Genteng atap', created_at: now, updated_at: now },
      { id: sj5, nomor: 'SJ-2026-005', project_id: P2.id, driver_name: 'Budi Hartono', vehicle_no: 'L 5678 CD', send_date: '2026-02-16', destination: 'Site Cluster B', issued_by: U1.id, status: 'Draft', notes: 'Cat finishing', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('surat_jalan_items', [
      // SJ-001
      { id: uuidv4(), surat_jalan_id: sj1, item_name: 'Semen Gresik 40kg', unit: 'Sak', qty: 50, notes: 'Unit A1-A3', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj1, item_name: 'Pasir Pasang', unit: 'M3', qty: 5, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj1, item_name: 'Kawat Bendrat', unit: 'Kg', qty: 10, notes: '', created_at: now, updated_at: now },
      // SJ-002
      { id: uuidv4(), surat_jalan_id: sj2, item_name: 'Besi Beton 10mm', unit: 'Batang', qty: 100, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj2, item_name: 'Besi Beton 12mm', unit: 'Batang', qty: 50, notes: '', created_at: now, updated_at: now },
      // SJ-003
      { id: uuidv4(), surat_jalan_id: sj3, item_name: 'Keramik 40x40 Putih', unit: 'Dus', qty: 30, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj3, item_name: 'Semen Nat Putih', unit: 'Kg', qty: 20, notes: '', created_at: now, updated_at: now },
      // SJ-004
      { id: uuidv4(), surat_jalan_id: sj4, item_name: 'Genteng Keramik', unit: 'Buah', qty: 250, notes: 'Unit B1-B2', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj4, item_name: 'Kayu Reng 3/4', unit: 'Batang', qty: 50, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj4, item_name: 'Paku Reng', unit: 'Kg', qty: 5, notes: '', created_at: now, updated_at: now },
      // SJ-005
      { id: uuidv4(), surat_jalan_id: sj5, item_name: 'Cat Tembok Putih', unit: 'Kaleng 5kg', qty: 15, notes: '', created_at: now, updated_at: now },
      { id: uuidv4(), surat_jalan_id: sj5, item_name: 'Kuas Cat 3 inch', unit: 'Pcs', qty: 8, notes: '', created_at: now, updated_at: now },
    ]);

    console.log('✅  surat_jalan: 5 records + 12 items');
    console.log('════════════════════════════════════════════════════');
    console.log('✅  SOP Seeder selesai: 31 parent + 60 item records');
  },

  async down(queryInterface) {
    // Hapus dalam urutan terbalik (child → parent)
    await queryInterface.bulkDelete('surat_jalan_items', null, {});
    await queryInterface.bulkDelete('surat_jalan', null, {});
    await queryInterface.bulkDelete('inventaris_lapangan', null, {});
    await queryInterface.bulkDelete('barang_keluar_items', null, {});
    await queryInterface.bulkDelete('barang_keluar', null, {});
    await queryInterface.bulkDelete('tanda_terima_gudang_items', null, {});
    await queryInterface.bulkDelete('tanda_terima_gudang', null, {});
    await queryInterface.bulkDelete('permintaan_material_items', null, {});
    await queryInterface.bulkDelete('permintaan_material', null, {});
    console.log('🗑  SOP data dihapus.');
  },
};
