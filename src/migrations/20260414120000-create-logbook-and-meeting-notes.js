'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      company_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(120), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('job_categories', ['company_id']);
    await queryInterface.addConstraint('job_categories', {
      fields: ['company_id', 'name'],
      type: 'unique',
      name: 'uniq_job_categories_company_name',
    });

    await queryInterface.createTable('logbooks', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      company_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      job_category_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'job_categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      description: { type: Sequelize.TEXT, allowNull: false },
      progress: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.ENUM('Draft', 'Submitted', 'Reviewed'), allowNull: false, defaultValue: 'Draft' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('logbooks', ['company_id']);
    await queryInterface.addIndex('logbooks', ['date']);
    await queryInterface.addIndex('logbooks', ['user_id']);
    await queryInterface.addIndex('logbooks', ['job_category_id']);

    await queryInterface.createTable('logbook_files', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      logbook_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'logbooks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      file_path: { type: Sequelize.STRING(255), allowNull: false },
      file_name: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('logbook_files', ['logbook_id']);

    await queryInterface.createTable('meeting_notes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      company_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'companies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING(200), allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      meeting_type: { type: Sequelize.ENUM('Mingguan', 'Bulanan'), allowNull: false, defaultValue: 'Mingguan' },
      participants: { type: Sequelize.TEXT, allowNull: true },
      discussion: { type: Sequelize.TEXT, allowNull: false },
      result: { type: Sequelize.TEXT, allowNull: false },
      created_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('meeting_notes', ['company_id']);
    await queryInterface.addIndex('meeting_notes', ['date']);
    await queryInterface.addIndex('meeting_notes', ['meeting_type']);

    await queryInterface.createTable('meeting_actions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      meeting_note_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'meeting_notes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      task: { type: Sequelize.TEXT, allowNull: false },
      assigned_to: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      deadline: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('meeting_actions', ['meeting_note_id']);
    await queryInterface.addIndex('meeting_actions', ['assigned_to']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('meeting_actions');
    await queryInterface.dropTable('meeting_notes');
    await queryInterface.dropTable('logbook_files');
    await queryInterface.dropTable('logbooks');
    await queryInterface.dropTable('job_categories');
  },
};
