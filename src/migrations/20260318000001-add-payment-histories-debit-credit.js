'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_histories', 'debit', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn('payment_histories', 'credit', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn('payment_histories', 'estimasi_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_histories', 'status', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('payment_histories', 'transaction_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    // Backfill: existing amount -> debit (if >= 0) or credit (if < 0)
    await queryInterface.sequelize.query(
      `UPDATE payment_histories SET debit = CASE WHEN amount >= 0 THEN amount ELSE 0 END, credit = CASE WHEN amount < 0 THEN -amount ELSE 0 END`
    );
    await queryInterface.changeColumn('payment_histories', 'debit', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('payment_histories', 'credit', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('payment_histories', 'debit');
    await queryInterface.removeColumn('payment_histories', 'credit');
    await queryInterface.removeColumn('payment_histories', 'estimasi_date');
    await queryInterface.removeColumn('payment_histories', 'status');
    await queryInterface.removeColumn('payment_histories', 'transaction_name');
  },
};
