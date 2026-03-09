'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    /* ──────────────────────────────────────────────
     * 1. Query FK references dari tabel lain
     * ────────────────────────────────────────────── */

    // QC Templates
    const [tpl36] = await queryInterface.sequelize.query(
      `SELECT id FROM qc_templates WHERE name LIKE '%Tipe 36%' LIMIT 1`
    );
    const [tpl45] = await queryInterface.sequelize.query(
      `SELECT id FROM qc_templates WHERE name LIKE '%Tipe 45%' LIMIT 1`
    );
    const QC_TPL_36 = tpl36.length ? tpl36[0].id : null;
    const QC_TPL_45 = tpl45.length ? tpl45[0].id : null;

    // Construction Statuses
    const csMap = {};
    const [csRows] = await queryInterface.sequelize.query(
      `SELECT id, name FROM construction_statuses`
    );
    csRows.forEach(r => { csMap[r.name] = r.id; });

    const CS = {
      PERSIAPAN : csMap['Persiapan Lahan']   || null,
      PONDASI   : csMap['Pondasi']           || null,
      STRUKTUR  : csMap['Struktur']          || null,
      DINDING   : csMap['Dinding & Plester'] || null,
      ATAP      : csMap['Atap']              || null,
      MEP       : csMap['Instalasi MEP']     || null,
      FINISHING : csMap['Finishing']          || null,
      SERAH     : csMap['Serah Terima']      || null,
    };

    /* ──────────────────────────────────────────────
     * 2. Projects
     * ────────────────────────────────────────────── */
    const P1 = uuidv4(); // Maisa Primeris Tahap 1
    const P2 = uuidv4(); // Maisa Primeris Tahap 2

    await queryInterface.bulkInsert('projects', [
      {
        id: P1,
        name: 'Maisa Primeris Tahap 1',
        type: 'cluster',
        location: 'Jl. Buah Batu No. 120, Bandung Selatan',
        units_count: 10,
        progress: 68,
        status: 'On Progress',
        deadline: '2027-03-31',
        lead: 'Ir. Bambang Sutrisno',
        qc_template_id: QC_TPL_36,
        construction_status: 'Finishing',
        start_date: '2026-01-15',
        end_date: '2027-03-31',
        description: 'Proyek perumahan cluster Maisa Primeris Tahap 1 terdiri dari 10 unit rumah tipe 36, 45, dan 54 di kawasan Bandung Selatan. Fasilitas meliputi taman bermain, pos keamanan 24 jam, dan akses jalan 6 meter.',
        created_at: now,
        updated_at: now,
      },
      {
        id: P2,
        name: 'Maisa Primeris Tahap 2',
        type: 'cluster',
        location: 'Jl. Soekarno-Hatta KM 12, Bandung Timur',
        units_count: 6,
        progress: 18,
        status: 'On Progress',
        deadline: '2027-12-31',
        lead: 'Ahmad Fauzi, S.T.',
        qc_template_id: QC_TPL_45,
        construction_status: 'Pondasi',
        start_date: '2026-06-01',
        end_date: '2027-12-31',
        description: 'Proyek perumahan cluster Maisa Primeris Tahap 2 dengan 6 unit di kawasan Bandung Timur. Konsep green living dengan area terbuka hijau 30% dari total lahan.',
        created_at: now,
        updated_at: now,
      },
    ]);

    /* ──────────────────────────────────────────────
     * 3. Project Units
     * ────────────────────────────────────────────── */

    // Helper: tentukan qc_template berdasarkan tipe rumah
    const qcFor = (tipe) => {
      if (tipe === 'Tipe 36') return QC_TPL_36;
      if (tipe === 'Tipe 45') return QC_TPL_45;
      return QC_TPL_45; // Tipe 54 pakai template terbesar
    };

    const units = [
      /* ═══ Project 1 — Tahap 1 (10 unit) ═══ */
      // Blok A
      {
        id: uuidv4(), project_id: P1, no: 'A-01', tipe: 'Tipe 36',
        progress: 100, status: 'Finishing',
        qc_status: 'Ongoing', qc_readiness: 85,
        construction_status_id: CS.FINISHING, qc_template_id: qcFor('Tipe 36'),
        notes: 'Unit sudah finishing, menunggu inspeksi QC akhir.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'A-02', tipe: 'Tipe 36',
        progress: 82, status: 'Instalasi MEP',
        qc_status: 'Ongoing', qc_readiness: 60,
        construction_status_id: CS.MEP, qc_template_id: qcFor('Tipe 36'),
        notes: 'Pemasangan listrik & plumbing sedang berjalan.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'A-03', tipe: 'Tipe 45',
        progress: 70, status: 'Dinding & Plester',
        qc_status: 'Ongoing', qc_readiness: 40,
        construction_status_id: CS.DINDING, qc_template_id: qcFor('Tipe 45'),
        notes: 'Plester dinding lantai 1 selesai, lantai 2 dalam proses.',
      },

      // Blok B
      {
        id: uuidv4(), project_id: P1, no: 'B-01', tipe: 'Tipe 45',
        progress: 95, status: 'Finishing',
        qc_status: 'Pass', qc_readiness: 100,
        construction_status_id: CS.FINISHING, qc_template_id: qcFor('Tipe 45'),
        notes: 'QC lulus. Tinggal pembersihan akhir sebelum serah terima.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'B-02', tipe: 'Tipe 54',
        progress: 55, status: 'Struktur',
        qc_status: 'Ongoing', qc_readiness: 25,
        construction_status_id: CS.STRUKTUR, qc_template_id: qcFor('Tipe 54'),
        notes: 'Pengecoran kolom lantai 2 minggu depan.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'B-03', tipe: 'Tipe 54',
        progress: 40, status: 'Pondasi',
        qc_status: 'Ongoing', qc_readiness: 15,
        construction_status_id: CS.PONDASI, qc_template_id: qcFor('Tipe 54'),
        notes: 'Pondasi cakar ayam selesai 80%.',
      },

      // Blok C
      {
        id: uuidv4(), project_id: P1, no: 'C-01', tipe: 'Tipe 36',
        progress: 30, status: 'Pondasi',
        qc_status: 'Ongoing', qc_readiness: 10,
        construction_status_id: CS.PONDASI, qc_template_id: qcFor('Tipe 36'),
        notes: 'Galian pondasi baru dimulai.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'C-02', tipe: 'Tipe 45',
        progress: 100, status: 'Serah Terima',
        qc_status: 'Pass', qc_readiness: 100,
        construction_status_id: CS.SERAH, qc_template_id: qcFor('Tipe 45'),
        notes: 'Unit sudah diserahterimakan ke konsumen Bapak Hendra.',
      },
      {
        id: uuidv4(), project_id: P1, no: 'C-03', tipe: 'Tipe 54',
        progress: 100, status: 'Serah Terima',
        qc_status: 'Pass', qc_readiness: 100,
        construction_status_id: CS.SERAH, qc_template_id: qcFor('Tipe 54'),
        notes: 'Unit sudah diserahterimakan ke konsumen Ibu Siti.',
      },

      // Blok D
      {
        id: uuidv4(), project_id: P1, no: 'D-01', tipe: 'Tipe 36',
        progress: 60, status: 'Dinding & Plester',
        qc_status: 'Ongoing', qc_readiness: 30,
        construction_status_id: CS.DINDING, qc_template_id: qcFor('Tipe 36'),
        notes: 'Pasang bata selesai, mulai plester minggu ini.',
      },

      /* ═══ Project 2 — Tahap 2 (6 unit) ═══ */
      // Blok E
      {
        id: uuidv4(), project_id: P2, no: 'E-01', tipe: 'Tipe 36',
        progress: 20, status: 'Persiapan Lahan',
        qc_status: 'Ongoing', qc_readiness: 0,
        construction_status_id: CS.PERSIAPAN, qc_template_id: qcFor('Tipe 36'),
        notes: 'Pematangan lahan dan pemasangan bouwplank.',
      },
      {
        id: uuidv4(), project_id: P2, no: 'E-02', tipe: 'Tipe 36',
        progress: 15, status: 'Persiapan Lahan',
        qc_status: 'Ongoing', qc_readiness: 0,
        construction_status_id: CS.PERSIAPAN, qc_template_id: qcFor('Tipe 36'),
        notes: 'Land clearing selesai, menunggu galian pondasi.',
      },
      {
        id: uuidv4(), project_id: P2, no: 'E-03', tipe: 'Tipe 45',
        progress: 25, status: 'Pondasi',
        qc_status: 'Ongoing', qc_readiness: 5,
        construction_status_id: CS.PONDASI, qc_template_id: qcFor('Tipe 45'),
        notes: 'Galian pondasi sedang berjalan.',
      },

      // Blok F
      {
        id: uuidv4(), project_id: P2, no: 'F-01', tipe: 'Tipe 45',
        progress: 28, status: 'Pondasi',
        qc_status: 'Ongoing', qc_readiness: 5,
        construction_status_id: CS.PONDASI, qc_template_id: qcFor('Tipe 45'),
        notes: 'Pondasi batu kali dalam pengerjaan.',
      },
      {
        id: uuidv4(), project_id: P2, no: 'F-02', tipe: 'Tipe 54',
        progress: 10, status: 'Persiapan Lahan',
        qc_status: 'Ongoing', qc_readiness: 0,
        construction_status_id: CS.PERSIAPAN, qc_template_id: qcFor('Tipe 54'),
        notes: 'Pemasangan pagar sementara proyek.',
      },
      {
        id: uuidv4(), project_id: P2, no: 'F-03', tipe: 'Tipe 54',
        progress: 5, status: 'Persiapan Lahan',
        qc_status: 'Ongoing', qc_readiness: 0,
        construction_status_id: CS.PERSIAPAN, qc_template_id: qcFor('Tipe 54'),
        notes: 'Baru tahap pengukuran ulang lahan.',
      },
    ].map(u => ({
      ...u,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('project_units', units);
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');

    // Hapus project_units dulu (child)
    await queryInterface.bulkDelete('project_units', {
      no: {
        [Op.in]: [
          'A-01', 'A-02', 'A-03',
          'B-01', 'B-02', 'B-03',
          'C-01', 'C-02', 'C-03',
          'D-01',
          'E-01', 'E-02', 'E-03',
          'F-01', 'F-02', 'F-03',
        ],
      },
    });

    // Hapus projects (parent)
    await queryInterface.bulkDelete('projects', {
      name: {
        [Op.in]: [
          'Maisa Primeris Tahap 1',
          'Maisa Primeris Tahap 2',
        ],
      },
    });
  },
};
