'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // project_id sudah redundan karena ada project_unit_id (FK ke project_units yang punya project reference)
    await queryInterface.removeColumn('housing_units', 'project_id');
    // consumer_id sudah redundan karena ada reserved_lead_id (FK ke leads yang track consumer)
    await queryInterface.removeColumn('housing_units', 'consumer_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('housing_units', 'consumer_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('housing_units', 'project_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
