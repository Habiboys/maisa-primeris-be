'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Housing Units — unit kavling perumahan (per tenant)
 * Catatan: unit_code & unit_type sekarang derivative dari project_units;
 * housing_unit hanya menyimpan detail kavling + relasi project_unit_id.
 */

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();

    const [projectUnits] = await queryInterface.sequelize.query(
      'SELECT id, no FROM project_units ORDER BY no ASC LIMIT 50'
    );
    const findProjectUnitId = (code) => {
      const found = projectUnits.find((u) => u.no === code);
      return found ? found.id : null;
    };

    const byCode = (code, extras) => ({
      id: uuidv4(),
      company_id: companyId,
      project_unit_id: findProjectUnitId(code),
      created_at: now,
      updated_at: now,
      ...extras,
    });

    const units = [
      byCode('A-01', { luas_tanah: 60, luas_bangunan: 36, harga_jual: 450000000, status: 'Tersedia', notes: null }),
      byCode('A-02', { luas_tanah: 60, luas_bangunan: 36, harga_jual: 450000000, status: 'Tersedia', notes: null }),
      byCode('A-03', { luas_tanah: 72, luas_bangunan: 45, harga_jual: 580000000, status: 'Tersedia', notes: null }),
      byCode('B-01', { luas_tanah: 72, luas_bangunan: 45, harga_jual: 580000000, status: 'Tersedia', notes: null }),
      byCode('B-02', { luas_tanah: 90, luas_bangunan: 54, harga_jual: 780000000, status: 'Tersedia', notes: null }),
      byCode('B-03', { luas_tanah: 90, luas_bangunan: 54, harga_jual: 780000000, status: 'Proses',   notes: 'Sedang dalam proses administrasi' }),
      byCode('C-01', { luas_tanah: 60, luas_bangunan: 36, harga_jual: 450000000, status: 'Proses',   notes: 'KPR sedang diproses bank' }),
      byCode('C-02', { luas_tanah: 72, luas_bangunan: 45, harga_jual: 580000000, status: 'Sold', akad_date: '2026-01-15', serah_terima_date: '2026-06-01', notes: null }),
      byCode('C-03', { luas_tanah: 90, luas_bangunan: 54, harga_jual: 780000000, status: 'Sold', akad_date: '2026-02-01', serah_terima_date: '2026-07-01', notes: null }),
      byCode('D-01', { luas_tanah: 60, luas_bangunan: 36, harga_jual: 450000000, status: 'Sold', akad_date: '2026-01-20', serah_terima_date: '2026-05-20', notes: null }),
    ].filter((u) => u.project_unit_id);

    if (units.length === 0) return;
    await queryInterface.bulkInsert('housing_units', units, {});
  },

  async down(queryInterface) {
    const [projectUnits] = await queryInterface.sequelize.query(
      "SELECT id FROM project_units WHERE no IN ('A-01','A-02','A-03','B-01','B-02','B-03','C-01','C-02','C-03','D-01')"
    );
    if (projectUnits.length === 0) return;
    await queryInterface.bulkDelete('housing_units', {
      project_unit_id: {
        [require('sequelize').Op.in]: projectUnits.map((u) => u.id),
      },
    }, {});
  },
};
