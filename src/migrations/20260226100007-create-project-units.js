'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_units', {
      id                    : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      project_id            : { type: Sequelize.UUID, allowNull: false, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      unit_code             : { type: Sequelize.STRING(50), allowNull: false },
      unit_type             : { type: Sequelize.STRING(50), allowNull: true },
      construction_status_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'construction_statuses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      qc_template_id        : { type: Sequelize.UUID, allowNull: true, references: { model: 'qc_templates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      notes                 : { type: Sequelize.TEXT, allowNull: true },
      created_at            : { type: Sequelize.DATE, allowNull: false },
      updated_at            : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('project_units', ['project_id']);
    await queryInterface.addIndex('project_units', ['project_id', 'unit_code'], { unique: true });
  },
  async down(queryInterface) { await queryInterface.dropTable('project_units'); },
};
