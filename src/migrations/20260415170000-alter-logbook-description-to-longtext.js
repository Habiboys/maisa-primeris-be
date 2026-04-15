'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('logbooks', 'description', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('logbooks', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
