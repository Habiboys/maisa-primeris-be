'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qc_submission_results', {
      id            : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      submission_id : { type: Sequelize.UUID, allowNull: false, references: { model: 'qc_submissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      item_id       : { type: Sequelize.UUID, allowNull: true, references: { model: 'qc_template_items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      result        : { type: Sequelize.ENUM('OK','Not OK','N/A'), allowNull: true },
      notes         : { type: Sequelize.TEXT, allowNull: true },
      photo_url     : { type: Sequelize.STRING(255), allowNull: true },
      created_at    : { type: Sequelize.DATE, allowNull: false },
      updated_at    : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('qc_submission_results', ['submission_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('qc_submission_results'); },
};
