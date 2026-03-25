'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pindah_unit', 'housing_unit_id_lama', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addColumn('pindah_unit', 'housing_unit_id_baru', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addIndex('pindah_unit', ['housing_unit_id_lama']);
    await queryInterface.addIndex('pindah_unit', ['housing_unit_id_baru']);
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('pindah_unit', 'housing_unit_id_lama');
    await queryInterface.removeColumn('pindah_unit', 'housing_unit_id_baru');
  },
};
