'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Dokumen Legal — PPJB, Akad, BAST, Pindah Unit, Pembatalan
 *
 * Seeder ini mengambil consumer_id dan housing_unit_id dari data yang
 * sudah ada di database (seeded oleh 000004 & 000005).
 *
 * Cara jalankan:
 *   npx sequelize-cli db:seed --seed 20260228000012-seed-legal-data.js
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ═══════════════════════════════════════════════════════════
    // Ambil referensi dari tabel yang sudah ada
    // ═══════════════════════════════════════════════════════════
    const [consumers] = await queryInterface.sequelize.query(
      `SELECT id, name, unit_code FROM consumers ORDER BY created_at LIMIT 5`
    );
    const [units] = await queryInterface.sequelize.query(
      `SELECT id, unit_code FROM housing_units ORDER BY created_at LIMIT 10`
    );

    if (consumers.length < 3 || units.length < 5) {
      console.log('⚠️  Skipping legal seeder — belum cukup consumers / housing_units.');
      return;
    }

    // Ambil ID
    const C1 = consumers[0].id; // Hendra — C-02
    const C2 = consumers[1].id; // Siti   — C-03
    const C3 = consumers[2].id; // Rudi   — D-01

    // Mapping unit_code → id
    const unitMap = {};
    units.forEach(u => { unitMap[u.unit_code] = u.id; });
    const U_C02 = unitMap['C-02'];
    const U_C03 = unitMap['C-03'];
    const U_D01 = unitMap['D-01'];
    const U_A01 = unitMap['A-01'];
    const U_A02 = unitMap['A-02'];

    // ═══════════════════════════════════════════════════════════
    // 1. PPJB
    // ═══════════════════════════════════════════════════════════
    const PPJB1 = uuidv4();
    const PPJB2 = uuidv4();
    const PPJB3 = uuidv4();

    await queryInterface.bulkInsert('ppjb', [
      {
        id: PPJB1,
        housing_unit_id: U_C02,
        consumer_id: C1,
        nomor_ppjb: 'PPJB/2026/001',
        tanggal_ppjb: '2026-01-10',
        harga_ppjb: 580000000,
        status: 'Ditandatangani',
        dokumen_url: null,
        notes: 'PPJB untuk unit C-02 — Bapak Hendra Kusuma',
        created_at: now,
        updated_at: now,
      },
      {
        id: PPJB2,
        housing_unit_id: U_C03,
        consumer_id: C2,
        nomor_ppjb: 'PPJB/2026/002',
        tanggal_ppjb: '2026-01-12',
        harga_ppjb: 780000000,
        status: 'Ditandatangani',
        dokumen_url: null,
        notes: 'PPJB untuk unit C-03 — Ibu Siti Rahayu',
        created_at: now,
        updated_at: now,
      },
      {
        id: PPJB3,
        housing_unit_id: U_D01,
        consumer_id: C3,
        nomor_ppjb: 'PPJB/2026/003',
        tanggal_ppjb: '2026-02-05',
        harga_ppjb: 450000000,
        status: 'Draft',
        dokumen_url: null,
        notes: 'PPJB untuk unit D-01 — Bapak Rudi Setiawan',
        created_at: now,
        updated_at: now,
      },
    ], {});

    // ═══════════════════════════════════════════════════════════
    // 2. AKAD — FK ke PPJB
    // ═══════════════════════════════════════════════════════════
    const AKAD1 = uuidv4();
    const AKAD2 = uuidv4();

    await queryInterface.bulkInsert('akad', [
      {
        id: AKAD1,
        housing_unit_id: U_C02,
        consumer_id: C1,
        ppjb_id: PPJB1,
        nomor_akad: 'AKD/2026/001',
        tanggal_akad: '2026-01-15',
        bank: 'BCA',
        notaris: 'Notaris Andi Sudirman, SH',
        status: 'Selesai',
        dokumen_url: null,
        notes: 'Akad kredit KPR BCA — unit C-02',
        created_at: now,
        updated_at: now,
      },
      {
        id: AKAD2,
        housing_unit_id: U_C03,
        consumer_id: C2,
        ppjb_id: PPJB2,
        nomor_akad: 'AKD/2026/002',
        tanggal_akad: '2026-01-20',
        bank: null,
        notaris: 'Notaris Maya Putri, SH',
        status: 'Selesai',
        dokumen_url: null,
        notes: 'Akad tunai — unit C-03',
        created_at: now,
        updated_at: now,
      },
    ], {});

    // ═══════════════════════════════════════════════════════════
    // 3. BAST — FK ke Akad
    // ═══════════════════════════════════════════════════════════
    await queryInterface.bulkInsert('bast', [
      {
        id: uuidv4(),
        housing_unit_id: U_C03,
        consumer_id: C2,
        akad_id: AKAD2,
        nomor_bast: 'BAST/2026/001',
        tanggal_bast: '2026-06-01',
        status: 'Ditandatangani',
        dokumen_url: null,
        notes: 'Serah terima unit C-03 — Ibu Siti Rahayu',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        housing_unit_id: U_C02,
        consumer_id: C1,
        akad_id: AKAD1,
        nomor_bast: 'BAST/2026/002',
        tanggal_bast: null,
        status: 'Draft',
        dokumen_url: null,
        notes: 'Menunggu selesainya pembangunan unit C-02',
        created_at: now,
        updated_at: now,
      },
    ], {});

    // ═══════════════════════════════════════════════════════════
    // 4. PINDAH UNIT
    // ═══════════════════════════════════════════════════════════
    const C4 = consumers.length > 3 ? consumers[3].id : C1; // Diana
    await queryInterface.bulkInsert('pindah_unit', [
      {
        id: uuidv4(),
        consumer_id: C4,
        unit_lama: 'A-03',
        unit_baru: 'B-01',
        tanggal_pindah: '2026-03-01',
        alasan: 'Konsumen meminta unit yang lebih besar dengan tipe Sapphire.',
        selisih_harga: 0,
        status: 'Selesai',
        dokumen_url: null,
        created_at: now,
        updated_at: now,
      },
    ], {});

    // ═══════════════════════════════════════════════════════════
    // 5. PEMBATALAN
    // ═══════════════════════════════════════════════════════════
    const C5 = consumers.length > 4 ? consumers[4].id : C1; // Agus
    await queryInterface.bulkInsert('pembatalan', [
      {
        id: uuidv4(),
        consumer_id: C5,
        unit_code: 'B-03',
        tanggal_batal: '2026-02-20',
        alasan: 'Konsumen mengajukan pembatalan karena masalah finansial.',
        refund_amount: 20000000,
        status: 'Selesai',
        dokumen_url: null,
        created_at: now,
        updated_at: now,
      },
    ], {});

    console.log('✅  Legal data seeded: 3 PPJB, 2 Akad, 2 BAST, 1 Pindah Unit, 1 Pembatalan');
  },

  async down(queryInterface) {
    const Op = require('sequelize').Op;

    await queryInterface.bulkDelete('pembatalan', { unit_code: 'B-03' }, {});
    await queryInterface.bulkDelete('pindah_unit', { unit_lama: 'A-03', unit_baru: 'B-01' }, {});
    await queryInterface.bulkDelete('bast', {
      nomor_bast: { [Op.in]: ['BAST/2026/001', 'BAST/2026/002'] },
    }, {});
    await queryInterface.bulkDelete('akad', {
      nomor_akad: { [Op.in]: ['AKD/2026/001', 'AKD/2026/002'] },
    }, {});
    await queryInterface.bulkDelete('ppjb', {
      nomor_ppjb: { [Op.in]: ['PPJB/2026/001', 'PPJB/2026/002', 'PPJB/2026/003'] },
    }, {});
  },
};
