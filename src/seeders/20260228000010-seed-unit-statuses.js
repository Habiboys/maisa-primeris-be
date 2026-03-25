'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Unit Statuses — peta siteplan unit (40 kavling), per tenant
 */

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();

    // Ambil housing_units yang sudah di-seed untuk mapping ke housing_unit_id
    const [housingUnits] = await queryInterface.sequelize.query(
      'SELECT id, unit_code FROM housing_units ORDER BY unit_code ASC'
    );
    const findHousingId = (code) => {
      const found = housingUnits.find((u) => u.unit_code === code);
      return found ? found.id : null;
    };

    const statuses = [];
    for (let i = 0; i < 40; i++) {
      const block = i < 20 ? 'A' : 'B';
      const num = String((i % 20) + 1).padStart(2, '0');
      const code = `${block}-${num}`;

      let status = 'Tersedia';
      if (i === 0 || i === 12 || i === 24) status = 'Sold';
      else if (i === 5 || i === 18 || i === 30) status = 'Booking';
      else if (i === 3 || i === 22) status = 'Indent';

      statuses.push({
        id: uuidv4(),
        company_id: companyId,
        unit_code: code,
        project_id: null,
        housing_unit_id: findHousingId(code),
        status,
        consumer_id: null,
        price: 750000000,
        notes: status !== 'Tersedia' ? `Status ${status}` : null,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert('unit_statuses', statuses, {});
  },

  async down(queryInterface) {
    const codes = [];
    for (let i = 0; i < 40; i++) {
      const block = i < 20 ? 'A' : 'B';
      const num = String((i % 20) + 1).padStart(2, '0');
      codes.push(`${block}-${num}`);
    }

    await queryInterface.bulkDelete('unit_statuses', {
      unit_code: {
        [require('sequelize').Op.in]: codes,
      },
    }, {});
  },
};
