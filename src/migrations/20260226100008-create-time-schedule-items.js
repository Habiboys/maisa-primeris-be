'use strict';
// Polymorphic – ref_id can point to project OR project_unit
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('time_schedule_items', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      ref_type   : { type: Sequelize.ENUM('project','project_unit'), allowNull: false },
      ref_id     : { type: Sequelize.UUID, allowNull: false },
      week_label : { type: Sequelize.STRING(50), allowNull: true },
      activity   : { type: Sequelize.STRING(255), allowNull: false },
      plan_start : { type: Sequelize.DATEONLY, allowNull: true },
      plan_end   : { type: Sequelize.DATEONLY, allowNull: true },
      actual_start: { type: Sequelize.DATEONLY, allowNull: true },
      actual_end  : { type: Sequelize.DATEONLY, allowNull: true },
      progress    : { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
      bobot       : { type: Sequelize.DECIMAL(5,2), allowNull: true },
      bulan1      : { type: Sequelize.JSON, allowNull: true },
      bulan2      : { type: Sequelize.JSON, allowNull: true },
      bulan3      : { type: Sequelize.JSON, allowNull: true },
      bulan4      : { type: Sequelize.JSON, allowNull: true },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('time_schedule_items', ['ref_type', 'ref_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('time_schedule_items'); },
};
