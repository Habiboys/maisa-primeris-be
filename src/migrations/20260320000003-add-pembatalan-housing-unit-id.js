'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pembatalan', 'housing_unit_id', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addIndex('pembatalan', ['housing_unit_id']);
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('pembatalan', 'housing_unit_id');
  },
};
