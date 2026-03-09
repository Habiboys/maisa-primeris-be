'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      user_id     : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      action      : { type: Sequelize.STRING(100), allowNull: false },
      entity      : { type: Sequelize.STRING(100), allowNull: true },
      entity_id   : { type: Sequelize.UUID, allowNull: true },
      description : { type: Sequelize.TEXT, allowNull: true },
      ip_address  : { type: Sequelize.STRING(45), allowNull: true },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('activity_logs', ['user_id']);
    await queryInterface.addIndex('activity_logs', ['created_at']);
  },
  async down(queryInterface) { await queryInterface.dropTable('activity_logs'); },
};
