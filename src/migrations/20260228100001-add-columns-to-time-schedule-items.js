'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('time_schedule_items', 'biaya', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      after: 'activity',
    });
    await queryInterface.addColumn('time_schedule_items', 'elevasi', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'biaya',
    });
    await queryInterface.addColumn('time_schedule_items', 'keterangan', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'bulan4',
    });
    await queryInterface.addColumn('time_schedule_items', 'urutan', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'ref_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('time_schedule_items', 'biaya');
    await queryInterface.removeColumn('time_schedule_items', 'elevasi');
    await queryInterface.removeColumn('time_schedule_items', 'keterangan');
    await queryInterface.removeColumn('time_schedule_items', 'urutan');
  },
};
