'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_histories', 'transaction_category', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    // Backfill: Debit jika debit > 0, Kredit jika credit > 0
    await queryInterface.sequelize.query(
      `UPDATE payment_histories SET transaction_category = CASE WHEN debit > 0 THEN 'Debit' WHEN credit > 0 THEN 'Kredit' ELSE 'Debit' END`
    );
    await queryInterface.changeColumn('payment_histories', 'transaction_category', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'Debit',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('payment_histories', 'transaction_category');
  },
};
