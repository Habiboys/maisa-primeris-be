'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('construction_statuses', 'color', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('construction_statuses', 'color', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  }
};
