'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Quality Control — template, sections, items, submissions & results (per tenant)
 */

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();

    const TEMPLATE_1 = uuidv4();
    const TEMPLATE_2 = uuidv4();

    const templates = [
      {
        id: TEMPLATE_1,
        company_id: companyId,
        name: 'Checklist Bangunan Rumah Tipe 36',
        description: 'Formulir inspeksi quality control untuk unit rumah tipe 36/60. Mencakup pemeriksaan pondasi, struktur, dinding, atap, plumbing, kelistrikan, dan finishing.',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: TEMPLATE_2,
        company_id: companyId,
        name: 'Checklist Bangunan Rumah Tipe 45',
        description: 'Formulir inspeksi quality control untuk unit rumah tipe 45/72. Mencakup pemeriksaan pondasi, struktur, dinding, atap, plumbing, kelistrikan, finishing, dan area carport.',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('qc_templates', templates, {});

    // ═══════════════════════════════════════════════════════════
    // 2. QC TEMPLATE SECTIONS
    // ═══════════════════════════════════════════════════════════

    // ── Template 1: Tipe 36 ──

    const T1_SEC_PONDASI     = uuidv4();
    const T1_SEC_STRUKTUR    = uuidv4();
    const T1_SEC_DINDING     = uuidv4();
    const T1_SEC_ATAP        = uuidv4();
    const T1_SEC_PLUMBING    = uuidv4();
    const T1_SEC_LISTRIK     = uuidv4();
    const T1_SEC_FINISHING   = uuidv4();

    // ── Template 2: Tipe 45 ──

    const T2_SEC_PONDASI     = uuidv4();
    const T2_SEC_STRUKTUR    = uuidv4();
    const T2_SEC_DINDING     = uuidv4();
    const T2_SEC_ATAP        = uuidv4();
    const T2_SEC_PLUMBING    = uuidv4();
    const T2_SEC_LISTRIK     = uuidv4();
    const T2_SEC_FINISHING   = uuidv4();
    const T2_SEC_CARPORT     = uuidv4();

    const sections = [
      // Template 1
      { id: T1_SEC_PONDASI,   template_id: TEMPLATE_1, name: 'Pondasi',                   order_index: 1, created_at: now, updated_at: now },
      { id: T1_SEC_STRUKTUR,  template_id: TEMPLATE_1, name: 'Struktur Beton & Baja',     order_index: 2, created_at: now, updated_at: now },
      { id: T1_SEC_DINDING,   template_id: TEMPLATE_1, name: 'Dinding & Plester',         order_index: 3, created_at: now, updated_at: now },
      { id: T1_SEC_ATAP,      template_id: TEMPLATE_1, name: 'Rangka Atap & Penutup',     order_index: 4, created_at: now, updated_at: now },
      { id: T1_SEC_PLUMBING,  template_id: TEMPLATE_1, name: 'Plumbing & Sanitasi',       order_index: 5, created_at: now, updated_at: now },
      { id: T1_SEC_LISTRIK,   template_id: TEMPLATE_1, name: 'Instalasi Listrik',         order_index: 6, created_at: now, updated_at: now },
      { id: T1_SEC_FINISHING, template_id: TEMPLATE_1, name: 'Finishing & Pekerjaan Akhir', order_index: 7, created_at: now, updated_at: now },

      // Template 2
      { id: T2_SEC_PONDASI,   template_id: TEMPLATE_2, name: 'Pondasi',                   order_index: 1, created_at: now, updated_at: now },
      { id: T2_SEC_STRUKTUR,  template_id: TEMPLATE_2, name: 'Struktur Beton & Kolom',    order_index: 2, created_at: now, updated_at: now },
      { id: T2_SEC_DINDING,   template_id: TEMPLATE_2, name: 'Dinding & Plester',         order_index: 3, created_at: now, updated_at: now },
      { id: T2_SEC_ATAP,      template_id: TEMPLATE_2, name: 'Rangka Atap & Penutup',     order_index: 4, created_at: now, updated_at: now },
      { id: T2_SEC_PLUMBING,  template_id: TEMPLATE_2, name: 'Plumbing & Sanitasi',       order_index: 5, created_at: now, updated_at: now },
      { id: T2_SEC_LISTRIK,   template_id: TEMPLATE_2, name: 'Instalasi Listrik',         order_index: 6, created_at: now, updated_at: now },
      { id: T2_SEC_FINISHING, template_id: TEMPLATE_2, name: 'Finishing & Pekerjaan Akhir', order_index: 7, created_at: now, updated_at: now },
      { id: T2_SEC_CARPORT,   template_id: TEMPLATE_2, name: 'Carport & Area Luar',       order_index: 8, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('qc_template_sections', sections, {});

    // ═══════════════════════════════════════════════════════════
    // 3. QC TEMPLATE ITEMS (checklist per section)
    // ═══════════════════════════════════════════════════════════

    // Helper untuk generate items
    const makeItems = (sectionId, descriptions) =>
      descriptions.map((desc, idx) => ({
        id: uuidv4(),
        section_id: sectionId,
        description: desc,
        order_index: idx + 1,
        created_at: now,
        updated_at: now,
      }));

    // Store item IDs for later submission results (first template items only)
    const allT1Items = [];
    const pushAndReturn = (sectionId, descriptions) => {
      const items = makeItems(sectionId, descriptions);
      allT1Items.push(...items);
      return items;
    };

    const items = [
      // ── Template 1: Tipe 36 ──
      ...pushAndReturn(T1_SEC_PONDASI, [
        'Kedalaman galian pondasi sesuai spesifikasi (min. 60 cm)',
        'Ukuran pondasi batu kali sesuai gambar kerja',
        'Campuran adukan pondasi sesuai mix design (1:4)',
        'Sloof beton terpasang dengan benar',
        'Waterproofing pada pondasi terpasang',
      ]),
      ...pushAndReturn(T1_SEC_STRUKTUR, [
        'Dimensi kolom praktis sesuai spesifikasi (15x15 cm)',
        'Tulangan kolom sesuai gambar (4Ø10, sengkang Ø8-150)',
        'Ring balk terpasang dan dimensi sesuai',
        'Bekisting rapi dan tidak bocor saat pengecoran',
        'Hasil pengecoran tidak keropos / honeycomb',
      ]),
      ...pushAndReturn(T1_SEC_DINDING, [
        'Pasangan bata/batako tegak lurus (cek waterpass)',
        'Ketebalan plesteran merata (±15 mm)',
        'Acian halus tanpa retak rambut',
        'Sudut ruangan siku dan rapi',
        'Benangan kusen rata dan presisi',
      ]),
      ...pushAndReturn(T1_SEC_ATAP, [
        'Kuda-kuda baja ringan terpasang sesuai gambar',
        'Jarak reng sesuai spesifikasi (25 cm)',
        'Genteng terpasang rapi tanpa celah',
        'Nok / bubungan terpasang dan tidak bocor',
        'Talang air terpasang dengan kemiringan yang tepat',
      ]),
      ...pushAndReturn(T1_SEC_PLUMBING, [
        'Instalasi pipa air bersih tidak bocor (uji tekanan)',
        'Kemiringan pipa buang air kotor memadai (min. 2%)',
        'Kran dan shower berfungsi dengan baik',
        'Closet duduk terpasang dan tidak goyang',
        'Floor drain berfungsi lancar (uji air 5 menit)',
        'Septictank terpasang dan saluran terhubung',
      ]),
      ...pushAndReturn(T1_SEC_LISTRIK, [
        'MCB utama dan panel distribusi terpasang',
        'Jumlah titik lampu sesuai denah (min. 8 titik)',
        'Jumlah stop kontak sesuai denah (min. 6 titik)',
        'Saklar berfungsi dengan baik',
        'Grounding / arde terpasang',
        'Kabel tidak terekspos / terlindungi conduit',
      ]),
      ...pushAndReturn(T1_SEC_FINISHING, [
        'Cat dinding interior rata 2 lapis tanpa belang',
        'Cat dinding eksterior rata dan tahan cuaca',
        'Lantai keramik terpasang rata, tidak hollow',
        'Nat keramik rapi dan bersih',
        'Kusen pintu & jendela terpasang kokoh',
        'Pintu utama berfungsi (buka tutup, kunci)',
        'Handle dan engsel semua pintu berfungsi',
        'Kaca jendela terpasang tanpa retak',
      ]),

      // ── Template 2: Tipe 45 (item berbeda, lebih detail) ──
      ...makeItems(T2_SEC_PONDASI, [
        'Kedalaman galian pondasi sesuai spesifikasi (min. 70 cm)',
        'Pondasi batu kali sesuai gambar kerja',
        'Campuran adukan pondasi 1:4 (semen:pasir)',
        'Sloof beton bertulang terpasang',
        'Waterproofing dan drainase pondasi',
        'Pondasi cakar ayam pada titik beban berat',
      ]),
      ...makeItems(T2_SEC_STRUKTUR, [
        'Dimensi kolom utama sesuai (20x20 cm)',
        'Tulangan kolom 4Ø12 sengkang Ø8-150',
        'Ring balk atas dan bawah terpasang',
        'Balok latei di atas bukaan terpasang',
        'Pengecoran tanpa honeycomb atau retak',
        'Curing beton dilakukan minimal 7 hari',
      ]),
      ...makeItems(T2_SEC_DINDING, [
        'Pasangan bata merah/hebel sesuai spesifikasi',
        'Dinding tegak lurus dan rata',
        'Plesteran ketebalan merata ±15 mm',
        'Acian halus tanpa retak',
        'Sudut ruangan presisi 90°',
        'Benangan bukaan pintu/jendela rapi',
      ]),
      ...makeItems(T2_SEC_ATAP, [
        'Kuda-kuda baja ringan terpasang sesuai desain',
        'Jarak reng dan usuk sesuai spesifikasi',
        'Genteng/metal roof terpasang tanpa celah',
        'Nok bubungan tersegel rapat',
        'Talang terpasang kemiringan tepat',
        'Lisplang dan soffit terpasang rapi',
      ]),
      ...makeItems(T2_SEC_PLUMBING, [
        'Pipa air bersih lulus uji tekanan',
        'Kemiringan pipa buang ≥ 2%',
        'Semua kran dan shower berfungsi',
        'Closet dan wastafel terpasang kokoh',
        'Floor drain berfungsi lancar',
        'Bak kontrol dan septictank terhubung',
        'Water heater connection tersedia',
      ]),
      ...makeItems(T2_SEC_LISTRIK, [
        'MCB panel utama dan distribusi terpasang',
        'Titik lampu sesuai denah (min. 12 titik)',
        'Stop kontak sesuai denah (min. 10 titik)',
        'Saklar semua berfungsi',
        'Arde / grounding terpasang',
        'Kabel terlindungi conduit PVC',
        'Persiapan AC split (pipa, kabel, drain)',
      ]),
      ...makeItems(T2_SEC_FINISHING, [
        'Cat interior 2 lapis rata tanpa belang',
        'Cat eksterior tahan cuaca',
        'Keramik lantai rata tanpa hollow',
        'Nat keramik rapi',
        'Kusen aluminium terpasang kokoh',
        'Pintu utama, kamar, KM berfungsi baik',
        'Handle, kunci, engsel berfungsi',
        'Kaca jendela utuh dan bersih',
        'Plafon gypsum rata tanpa retak',
      ]),
      ...makeItems(T2_SEC_CARPORT, [
        'Lantai carport cor / paving terpasang rata',
        'Kemiringan drainase carport memadai',
        'Tiang kanopi terpasang kokoh',
        'Atap kanopi polycarbonate / spandek terpasang',
        'Saluran air hujan terhubung ke drainase',
      ]),
    ];

    await queryInterface.bulkInsert('qc_template_items', items, {});

    // ═══════════════════════════════════════════════════════════
    // 4. QC SUBMISSIONS (contoh 2 submission)
    // ═══════════════════════════════════════════════════════════

    const SUBMISSION_1 = uuidv4();
    const SUBMISSION_2 = uuidv4();

    const submissions = [
      {
        id: SUBMISSION_1,
        project_id: null,       // akan terhubung jika ada project
        unit_id: null,          // akan terhubung jika ada project unit
        template_id: TEMPLATE_1,
        submitted_by: null,     // akan terhubung jika ada user
        submission_date: '2026-02-20',
        status: 'Approved',
        notes: 'Inspeksi unit A-01 tipe 36/60 — semua item lulus, unit siap serah terima.',
        created_at: now,
        updated_at: now,
      },
      {
        id: SUBMISSION_2,
        project_id: null,
        unit_id: null,
        template_id: TEMPLATE_1,
        submitted_by: null,
        submission_date: '2026-02-25',
        status: 'Rejected',
        notes: 'Inspeksi unit A-02 tipe 36/60 — ditemukan beberapa item yang perlu perbaikan pada dinding dan plumbing.',
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('qc_submissions', submissions, {});

    // ═══════════════════════════════════════════════════════════
    // 5. QC SUBMISSION RESULTS
    //    - Submission 1: semua OK
    //    - Submission 2: sebagian Not OK (dinding & plumbing)
    // ═══════════════════════════════════════════════════════════

    const results = allT1Items.map((item) => {
      // Submission 1 — semua OK
      return {
        id: uuidv4(),
        submission_id: SUBMISSION_1,
        item_id: item.id,
        result: 'OK',
        notes: null,
        photo_url: null,
        created_at: now,
        updated_at: now,
      };
    });

    // Submission 2 — sebagian Not OK
    const notOkSections = [T1_SEC_DINDING, T1_SEC_PLUMBING];
    const results2 = allT1Items.map((item) => {
      const isNotOk = notOkSections.includes(item.section_id);
      return {
        id: uuidv4(),
        submission_id: SUBMISSION_2,
        item_id: item.id,
        result: isNotOk ? 'Not OK' : 'OK',
        notes: isNotOk ? 'Perlu perbaikan / revisi' : null,
        photo_url: null,
        created_at: now,
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert('qc_submission_results', [...results, ...results2], {});
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');

    // Hapus dari bawah ke atas (child → parent)
    await queryInterface.bulkDelete('qc_submission_results', null, {});
    await queryInterface.bulkDelete('qc_submissions', {
      notes: { [Op.like]: 'Inspeksi unit A-0%' },
    }, {});
    await queryInterface.bulkDelete('qc_template_items', null, {});
    await queryInterface.bulkDelete('qc_template_sections', null, {});
    await queryInterface.bulkDelete('qc_templates', {
      name: { [Op.like]: 'Checklist Bangunan Rumah%' },
    }, {});
  },
};
