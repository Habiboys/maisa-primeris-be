'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consumers', {
      id             : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name           : { type: Sequelize.STRING(100), allowNull: false },
      nik            : { type: Sequelize.STRING(20), allowNull: true },
      phone          : { type: Sequelize.STRING(20), allowNull: true },
      email          : { type: Sequelize.STRING(150), allowNull: true },
      address        : { type: Sequelize.TEXT, allowNull: true },
      unit_code      : { type: Sequelize.STRING(50), allowNull: true },
      project_id     : { type: Sequelize.UUID, allowNull: true },
      total_price    : { type: Sequelize.BIGINT, allowNull: true },
      paid_amount    : { type: Sequelize.BIGINT, defaultValue: 0 },
      payment_scheme : { type: Sequelize.STRING(80), allowNull: true },
      status         : { type: Sequelize.ENUM('Aktif','Lunas','Dibatalkan'), defaultValue: 'Aktif', allowNull: false },
      created_at     : { type: Sequelize.DATE, allowNull: false },
      updated_at     : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('consumers', ['nik']);
  },
  async down(queryInterface) { await queryInterface.dropTable('consumers'); },
};
