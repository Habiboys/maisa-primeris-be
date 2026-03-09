'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Lokasi Kerja (Work Locations) — data master absensi
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const locations = [
      {
        id       : uuidv4(),
        name     : 'Kantor Pusat Maisa Primeris',
        address  : 'Jl. Raya Perumahan No. 1, Jakarta Selatan',
        latitude : -6.2088,
        longitude: 106.8456,
        radius_m : 150,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id       : uuidv4(),
        name     : 'Lokasi Proyek Cluster Emerald',
        address  : 'Jl. Emerald Heights Blok A, Bogor',
        latitude : -6.5971,
        longitude: 106.8060,
        radius_m : 200,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id       : uuidv4(),
        name     : 'Lokasi Proyek Cluster Sapphire',
        address  : 'Jl. Sapphire Residence Blok B, Bogor',
        latitude : -6.6012,
        longitude: 106.8100,
        radius_m : 200,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('work_locations', locations, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('work_locations', {
      name: {
        [require('sequelize').Op.in]: [
          'Kantor Pusat Maisa Primeris',
          'Lokasi Proyek Cluster Emerald',
          'Lokasi Proyek Cluster Sapphire',
        ],
      },
    }, {});
  },
};
