'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('qc_submission_results', 'photo_url', {
      type: Sequelize.TEXT('medium'),
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('qc_submission_results', 'photo_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
