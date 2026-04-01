'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Housing Units — unit kavling perumahan (per tenant)
 */

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();

    // Untuk seed awal, hubungkan ke project_units jika ada yang no = unit_code
    const [projectUnits] = await queryInterface.sequelize.query(
      'SELECT id, no FROM project_units ORDER BY no ASC LIMIT 50'
    );
    const findProjectUnitId = (code) => {
      const found = projectUnits.find((u) => u.no === code);
      return found ? found.id : null;
    };

    const units = [
      { id: uuidv4(), company_id: companyId, unit_code: 'A-01', project_unit_id: findProjectUnitId('A-01'), unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'A-02', project_unit_id: findProjectUnitId('A-02'), unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'A-03', project_unit_id: findProjectUnitId('A-03'), unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'B-01', project_unit_id: findProjectUnitId('B-01'), unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'B-02', project_unit_id: findProjectUnitId('B-02'), unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'B-03', project_unit_id: findProjectUnitId('B-03'), unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, status: 'Proses',   notes: 'Sedang dalam proses administrasi', created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'C-01', project_unit_id: findProjectUnitId('C-01'), unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, status: 'Proses',   notes: 'KPR sedang diproses bank', created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'C-02', project_unit_id: findProjectUnitId('C-02'), unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, status: 'Sold', akad_date: '2026-01-15', serah_terima_date: '2026-06-01', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'C-03', project_unit_id: findProjectUnitId('C-03'), unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, status: 'Sold', akad_date: '2026-02-01', serah_terima_date: '2026-07-01', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), company_id: companyId, unit_code: 'D-01', project_unit_id: findProjectUnitId('D-01'), unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, status: 'Sold', akad_date: '2026-01-20', serah_terima_date: '2026-05-20', notes: null, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('housing_units', units, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('housing_units', {
      unit_code: {
        [require('sequelize').Op.in]: ['A-01','A-02','A-03','B-01','B-02','B-03','C-01','C-02','C-03','D-01'],
      },
    }, {});
  },
};
