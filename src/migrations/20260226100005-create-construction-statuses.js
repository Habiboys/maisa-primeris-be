'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('construction_statuses', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name       : { type: Sequelize.STRING(100), allowNull: false, unique: true },
      color      : { type: Sequelize.STRING(20), allowNull: true },
      order_index: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at : { type: Sequelize.DATE, allowNull: false },
      updated_at : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('construction_statuses'); },
};
