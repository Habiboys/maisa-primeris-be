'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qc_submissions', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      project_id      : { type: Sequelize.UUID, allowNull: true, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      unit_id         : { type: Sequelize.UUID, allowNull: true, references: { model: 'project_units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      template_id     : { type: Sequelize.UUID, allowNull: true, references: { model: 'qc_templates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      submitted_by    : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      submission_date : { type: Sequelize.DATEONLY, allowNull: false },
      status          : { type: Sequelize.ENUM('Draft','Submitted','Approved','Rejected'), defaultValue: 'Draft', allowNull: false },
      notes           : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('qc_submissions', ['project_id']);
    await queryInterface.addIndex('qc_submissions', ['unit_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('qc_submissions'); },
};
