'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Finance & Accounting — Transactions, Consumers, Payment Histories
 *
 * Data ini BERBEDA dari mock data frontend (mockData.ts).
 * Seeder ini merupakan data realistis untuk database.
 *
 * Mencakup:
 *  - 5 konsumen dengan berbagai status dan skema pembayaran
 *  - 15 transaksi (pemasukan & pengeluaran)
 *  - Riwayat pembayaran per konsumen
 *
 * Cara jalankan:
 *   npx sequelize-cli db:seed --seed 20260228000005-seed-finance-data.js
 *
 * Cara undo:
 *   npx sequelize-cli db:seed:undo --seed 20260228000005-seed-finance-data.js
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ═══════════════════════════════════════════════════════════
    // 1. CONSUMERS — IDs harus deterministik untuk FK payment_histories
    // ═══════════════════════════════════════════════════════════

    const C1 = uuidv4(); // Hendra — KPR aktif
    const C2 = uuidv4(); // Siti — Tunai lunas
    const C3 = uuidv4(); // Rudi — KPR aktif
    const C4 = uuidv4(); // Diana — Cash Bertahap aktif
    const C5 = uuidv4(); // Agus — Dibatalkan

    const consumers = [
      { id: C1, name: 'Bapak Hendra Kusuma',   nik: '3201010101800001', phone: '081234560001', email: 'hendra@email.com',  address: 'Jl. Mawar No.12, Bogor',        unit_code: 'C-02', project_id: null, total_price: 580000000, paid_amount: 290000000,  payment_scheme: 'KPR',            status: 'Aktif',      created_at: now, updated_at: now },
      { id: C2, name: 'Ibu Siti Rahayu',       nik: '3201010101810002', phone: '081234560002', email: 'siti@email.com',    address: 'Jl. Melati No.5, Depok',         unit_code: 'C-03', project_id: null, total_price: 780000000, paid_amount: 780000000,  payment_scheme: 'Tunai',          status: 'Lunas',      created_at: now, updated_at: now },
      { id: C3, name: 'Bapak Rudi Setiawan',   nik: '3201010101820003', phone: '081234560003', email: 'rudi@email.com',    address: 'Jl. Anggrek No.8, Bekasi',       unit_code: 'D-01', project_id: null, total_price: 450000000, paid_amount: 135000000,  payment_scheme: 'KPR',            status: 'Aktif',      created_at: now, updated_at: now },
      { id: C4, name: 'Ibu Diana Permata',     nik: '3201010101830004', phone: '081234560004', email: 'diana@email.com',   address: 'Jl. Dahlia No.22, Tangerang',    unit_code: 'A-03', project_id: null, total_price: 580000000, paid_amount: 174000000,  payment_scheme: 'Cash Bertahap',  status: 'Aktif',      created_at: now, updated_at: now },
      { id: C5, name: 'Bapak Agus Firmansyah', nik: '3201010101840005', phone: '081234560005', email: 'agus@email.com',    address: 'Jl. Kenanga No.15, Cibinong',    unit_code: 'B-03', project_id: null, total_price: 780000000, paid_amount: 25000000,   payment_scheme: 'KPR',            status: 'Dibatalkan', created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('consumers', consumers, {});

    // ═══════════════════════════════════════════════════════════
    // 2. PAYMENT HISTORIES
    // ═══════════════════════════════════════════════════════════

    const payments = [
      // ── Hendra (C1): KPR — 4 pembayaran totalnya 290jt ──
      { id: uuidv4(), consumer_id: C1, payment_date: '2026-01-05', amount: 58000000,  payment_method: 'Transfer BCA', notes: 'Booking Fee + DP 10%',                  receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C1, payment_date: '2026-01-20', amount: 174000000, payment_method: 'Transfer BCA', notes: 'Pencairan KPR Termin 1 via Bank BCA',   receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C1, payment_date: '2026-02-05', amount: 5800000,   payment_method: 'Auto Debet',   notes: 'Angsuran KPR Bulan Februari',           receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C1, payment_date: '2026-03-05', amount: 52200000,  payment_method: 'Auto Debet',   notes: 'Angsuran KPR Bulan Maret',              receipt_file: null, created_at: now, updated_at: now },

      // ── Siti (C2): Tunai — 1 pelunasan ──
      { id: uuidv4(), consumer_id: C2, payment_date: '2026-01-15', amount: 780000000, payment_method: 'Transfer BCA', notes: 'Pelunasan unit tunai penuh',             receipt_file: null, created_at: now, updated_at: now },

      // ── Rudi (C3): KPR — 3 pembayaran totalnya 135jt ──
      { id: uuidv4(), consumer_id: C3, payment_date: '2026-01-20', amount: 45000000,  payment_method: 'Transfer BNI', notes: 'Booking Fee + DP 10%',                  receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C3, payment_date: '2026-02-10', amount: 45000000,  payment_method: 'Auto Debet',   notes: 'Pencairan KPR Termin 1 via Bank BNI',   receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C3, payment_date: '2026-03-01', amount: 45000000,  payment_method: 'Auto Debet',   notes: 'Angsuran KPR Bulan Maret',              receipt_file: null, created_at: now, updated_at: now },

      // ── Diana (C4): Cash Bertahap — 3 pembayaran totalnya 174jt ──
      { id: uuidv4(), consumer_id: C4, payment_date: '2026-01-08', amount: 58000000,  payment_method: 'Transfer Mandiri', notes: 'Booking Fee + DP 10%',              receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C4, payment_date: '2026-02-08', amount: 58000000,  payment_method: 'Transfer Mandiri', notes: 'Angsuran Cash Bertahap Ke-2',       receipt_file: null, created_at: now, updated_at: now },
      { id: uuidv4(), consumer_id: C4, payment_date: '2026-03-01', amount: 58000000,  payment_method: 'Transfer Mandiri', notes: 'Angsuran Cash Bertahap Ke-3',       receipt_file: null, created_at: now, updated_at: now },

      // ── Agus (C5): Dibatalkan — 1 pembayaran booking saja ──
      { id: uuidv4(), consumer_id: C5, payment_date: '2026-01-12', amount: 25000000,  payment_method: 'Cash',             notes: 'Booking Fee (sebelum pembatalan)',  receipt_file: null, created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('payment_histories', payments, {});

    // ═══════════════════════════════════════════════════════════
    // 3. TRANSACTIONS — arus kas perusahaan
    // ═══════════════════════════════════════════════════════════

    const transactions = [
      // ── Pemasukan ──
      { id: uuidv4(), transaction_date: '2026-01-05', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'DP Unit C-02 — Bpk Hendra Kusuma',         amount: 58000000,  payment_method: 'Transfer BCA',    reference_no: 'TRX-2026-001', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-01-08', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'DP Unit A-03 — Ibu Diana Permata',          amount: 58000000,  payment_method: 'Transfer Mandiri', reference_no: 'TRX-2026-002', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-01-12', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'Booking Fee Unit B-03 — Bpk Agus',          amount: 25000000,  payment_method: 'Cash',            reference_no: 'TRX-2026-003', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-01-15', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'Pelunasan Unit C-03 — Ibu Siti Rahayu',     amount: 780000000, payment_method: 'Transfer BCA',    reference_no: 'TRX-2026-004', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-01-20', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'DP Unit D-01 — Bpk Rudi Setiawan',          amount: 45000000,  payment_method: 'Transfer BNI',    reference_no: 'TRX-2026-005', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-05', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'Angsuran KPR Februari — Bpk Hendra',        amount: 5800000,   payment_method: 'Auto Debet',      reference_no: 'TRX-2026-006', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-08', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'Angsuran Cash Bertahap Ke-2 — Ibu Diana',   amount: 58000000,  payment_method: 'Transfer Mandiri', reference_no: 'TRX-2026-007', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-10', type: 'Pemasukan',   category: 'Penjualan Unit', description: 'Pencairan KPR Termin 1 — Bpk Rudi',         amount: 45000000,  payment_method: 'Auto Debet',      reference_no: 'TRX-2026-008', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },

      // ── Pengeluaran ──
      { id: uuidv4(), transaction_date: '2026-01-10', type: 'Pengeluaran', category: 'Material',       description: 'Pembelian Besi Cor Proyek Semanggi',        amount: 45000000,  payment_method: 'Transfer BCA',    reference_no: 'TRX-2026-009', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-01-25', type: 'Pengeluaran', category: 'Operasional',    description: 'Gaji Karyawan Januari 2026',                amount: 85000000,  payment_method: 'Transfer',        reference_no: 'TRX-2026-010', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-01', type: 'Pengeluaran', category: 'Material',       description: 'Pembelian Semen & Pasir 200 sak',           amount: 28000000,  payment_method: 'Cash',            reference_no: 'TRX-2026-011', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-12', type: 'Pengeluaran', category: 'Material',       description: 'Pembelian Keramik & Granit Tipe 45',        amount: 32000000,  payment_method: 'Transfer BCA',    reference_no: 'TRX-2026-012', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-15', type: 'Pengeluaran', category: 'Marketing',      description: 'Biaya Iklan Facebook & Instagram Feb',      amount: 12000000,  payment_method: 'Transfer BCA',    reference_no: 'TRX-2026-013', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-20', type: 'Pengeluaran', category: 'Operasional',    description: 'Biaya Notaris & Legalitas 3 Unit',          amount: 15000000,  payment_method: 'Transfer',        reference_no: 'TRX-2026-014', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
      { id: uuidv4(), transaction_date: '2026-02-25', type: 'Pengeluaran', category: 'Operasional',    description: 'Gaji Karyawan Februari 2026',               amount: 85000000,  payment_method: 'Transfer',        reference_no: 'TRX-2026-015', attachment: null, project_id: null, created_by: null, created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('transactions', transactions, {});
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');

    // Hapus child dulu (payment_histories), lalu parent (consumers & transactions)
    await queryInterface.bulkDelete('payment_histories', {
      notes: {
        [Op.or]: [
          { [Op.like]: 'Booking Fee%' },
          { [Op.like]: 'Pelunasan%' },
          { [Op.like]: 'Pencairan KPR%' },
          { [Op.like]: 'Angsuran%' },
        ],
      },
    }, {});

    await queryInterface.bulkDelete('transactions', {
      reference_no: { [Op.like]: 'TRX-2026-%' },
    }, {});

    await queryInterface.bulkDelete('consumers', {
      phone: {
        [Op.in]: ['081234560001', '081234560002', '081234560003', '081234560004', '081234560005'],
      },
    }, {});
  },
};
