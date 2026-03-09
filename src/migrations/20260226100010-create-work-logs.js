'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_logs', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      project_id  : { type: Sequelize.UUID, allowNull: true, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      unit_id     : { type: Sequelize.UUID, allowNull: true, references: { model: 'project_units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      reported_by : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      work_date   : { type: Sequelize.DATEONLY, allowNull: false },
      description : { type: Sequelize.TEXT, allowNull: false },
      workers     : { type: Sequelize.INTEGER, allowNull: true },
      weather     : { type: Sequelize.STRING(50), allowNull: true },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('work_logs', ['project_id']);
    await queryInterface.addIndex('work_logs', ['work_date']);
  },
  async down(queryInterface) { await queryInterface.dropTable('work_logs'); },
};
