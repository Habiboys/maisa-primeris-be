'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_locations', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name       : { type: Sequelize.STRING(150), allowNull: false },
      address    : { type: Sequelize.TEXT, allowNull: true },
      latitude   : { type: Sequelize.DECIMAL(10,8), allowNull: true },
      longitude  : { type: Sequelize.DECIMAL(11,8), allowNull: true },
      radius_m   : { type: Sequelize.INTEGER, defaultValue: 100, comment: 'Allowed radius in meters for attendance' },
      is_active  : { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at : { type: Sequelize.DATE, allowNull: false },
      updated_at : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('work_locations'); },
};
