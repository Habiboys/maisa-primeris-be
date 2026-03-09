'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('construction_statuses', 'progress', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      after: 'color',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('construction_statuses', 'progress');
  },
};
