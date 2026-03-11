'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Housing Payment Histories — riwayat pembayaran unit perumahan
 * Merujuk ke housing_units yang sudah di-seed (unit_code C-02, C-03, D-01, B-03, C-01)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil housing_units yang sudah di-seed (status Proses & Sold pasti punya pembayaran)
    const units = await queryInterface.sequelize.query(
      `SELECT id, unit_code, status FROM housing_units WHERE status IN ('Proses', 'Sold') ORDER BY unit_code ASC LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!units.length) return;

    const now = new Date();
    const payments = [];

    for (const unit of units) {
      // Semua unit Proses/Sold minimal punya Booking Fee
      payments.push({
        id: uuidv4(),
        housing_unit_id: unit.id,
        payment_date: '2026-01-10',
        amount: 5000000,
        type: 'Booking Fee',
        description: `Booking fee unit ${unit.unit_code}`,
        receipt_file: null,
        created_at: now,
        updated_at: now,
      });

      // Unit Sold punya DP dan cicilan
      if (unit.status === 'Sold') {
        payments.push({
          id: uuidv4(),
          housing_unit_id: unit.id,
          payment_date: '2026-01-20',
          amount: 50000000,
          type: 'DP',
          description: `Down payment unit ${unit.unit_code}`,
          receipt_file: null,
          created_at: now,
          updated_at: now,
        });

        payments.push({
          id: uuidv4(),
          housing_unit_id: unit.id,
          payment_date: '2026-02-15',
          amount: 3500000,
          type: 'Cicilan',
          description: `Cicilan ke-1 unit ${unit.unit_code}`,
          receipt_file: null,
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (payments.length) {
      await queryInterface.bulkInsert('housing_payment_histories', payments, {});
    }
  },

  async down(queryInterface, Sequelize) {
    // Hapus payment histories yang terkait housing_units seeder
    const units = await queryInterface.sequelize.query(
      `SELECT id FROM housing_units WHERE status IN ('Proses', 'Sold')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (units.length) {
      await queryInterface.bulkDelete('housing_payment_histories', {
        housing_unit_id: {
          [require('sequelize').Op.in]: units.map(u => u.id),
        },
      }, {});
    }
  },
};

