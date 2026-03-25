'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('unit_statuses', 'housing_unit_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'housing_units', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('unit_statuses', ['housing_unit_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('unit_statuses', ['housing_unit_id']).catch(() => {});
    await queryInterface.removeColumn('unit_statuses', 'housing_unit_id');
  },
};

