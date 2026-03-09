'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Housing Units — unit kavling perumahan
 * 10 unit sample: status Tersedia, Proses, Sold
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const units = [
      // Tersedia
      { id: uuidv4(), unit_code: 'A-01', project_id: null, unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, consumer_id: null, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'A-02', project_id: null, unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, consumer_id: null, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'A-03', project_id: null, unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, consumer_id: null, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'B-01', project_id: null, unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, consumer_id: null, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'B-02', project_id: null, unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, consumer_id: null, status: 'Tersedia', notes: null, created_at: now, updated_at: now },
      // Proses
      { id: uuidv4(), unit_code: 'B-03', project_id: null, unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, consumer_id: null, status: 'Proses',   notes: 'Sedang dalam proses administrasi', created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'C-01', project_id: null, unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, consumer_id: null, status: 'Proses',   notes: 'KPR sedang diproses bank', created_at: now, updated_at: now },
      // Sold
      { id: uuidv4(), unit_code: 'C-02', project_id: null, unit_type: 'Sapphire (45/72)', luas_tanah: 72,  luas_bangunan: 45, harga_jual: 580000000, consumer_id: null, status: 'Sold', akad_date: '2026-01-15', serah_terima_date: '2026-06-01', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'C-03', project_id: null, unit_type: 'Diamond (54/90)',  luas_tanah: 90,  luas_bangunan: 54, harga_jual: 780000000, consumer_id: null, status: 'Sold', akad_date: '2026-02-01', serah_terima_date: '2026-07-01', notes: null, created_at: now, updated_at: now },
      { id: uuidv4(), unit_code: 'D-01', project_id: null, unit_type: 'Emerald (36/60)',  luas_tanah: 60,  luas_bangunan: 36, harga_jual: 450000000, consumer_id: null, status: 'Sold', akad_date: '2026-01-20', serah_terima_date: '2026-05-20', notes: null, created_at: now, updated_at: now },
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
