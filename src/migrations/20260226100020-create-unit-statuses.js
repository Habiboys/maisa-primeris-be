'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unit_statuses', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      unit_code  : { type: Sequelize.STRING(50), allowNull: false },
      project_id : { type: Sequelize.UUID, allowNull: true },
      status     : { type: Sequelize.ENUM('Tersedia','Indent','Booking','Sold','Batal'), defaultValue: 'Tersedia', allowNull: false },
      consumer_id: { type: Sequelize.UUID, allowNull: true },
      price      : { type: Sequelize.BIGINT, allowNull: true },
      notes      : { type: Sequelize.TEXT, allowNull: true },
      created_at : { type: Sequelize.DATE, allowNull: false },
      updated_at : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('unit_statuses', ['project_id', 'unit_code']);
    await queryInterface.addIndex('unit_statuses', ['status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('unit_statuses'); },
};
