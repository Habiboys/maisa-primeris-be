'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_logs', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      project_id  : { type: Sequelize.UUID, allowNull: true, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      item_name   : { type: Sequelize.STRING(150), allowNull: false },
      category    : { type: Sequelize.STRING(80), allowNull: true },
      unit        : { type: Sequelize.STRING(30), allowNull: true },
      qty_in      : { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      qty_out     : { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      qty_balance : { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      type        : { type: Sequelize.ENUM('masuk','keluar'), allowNull: false },
      notes       : { type: Sequelize.TEXT, allowNull: true },
      log_date    : { type: Sequelize.DATEONLY, allowNull: false },
      created_by  : { type: Sequelize.UUID, allowNull: true },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('inventory_logs', ['project_id']);
    await queryInterface.addIndex('inventory_logs', ['log_date']);
  },
  async down(queryInterface) { await queryInterface.dropTable('inventory_logs'); },
};
