'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Lokasi Kerja (Work Locations) — data master absensi, per tenant
 */

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();
    const locations = [
      {
        id       : uuidv4(),
        company_id: companyId,
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
        company_id: companyId,
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
        company_id: companyId,
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
    const { Op } = require('sequelize');
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE code = 'maisa-primeris' LIMIT 1`
    );
    const companyId = rows[0]?.id;
    const where = {
      name: { [Op.in]: ['Kantor Pusat Maisa Primeris', 'Lokasi Proyek Cluster Emerald', 'Lokasi Proyek Cluster Sapphire'] },
    };
    if (companyId) where.company_id = companyId;
    await queryInterface.bulkDelete('work_locations', where, {});
  },
};
