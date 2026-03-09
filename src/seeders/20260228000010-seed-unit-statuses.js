'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Unit Statuses — peta siteplan unit (40 kavling)
 * Status sesuai ENUM: Tersedia, Indent, Booking, Sold, Batal
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

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
        unit_code: code,
        project_id: null,
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
