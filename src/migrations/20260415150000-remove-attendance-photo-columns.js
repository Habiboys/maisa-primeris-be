'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('attendances', 'clock_in_photo');
    await queryInterface.removeColumn('attendances', 'clock_out_photo');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('attendances', 'clock_in_photo', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('attendances', 'clock_out_photo', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
