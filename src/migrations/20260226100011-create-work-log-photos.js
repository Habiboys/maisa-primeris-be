'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_log_photos', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      work_log_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'work_logs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      photo_url  : { type: Sequelize.STRING(255), allowNull: false },
      caption    : { type: Sequelize.STRING(255), allowNull: true },
      created_at : { type: Sequelize.DATE, allowNull: false },
      updated_at : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('work_log_photos', ['work_log_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('work_log_photos'); },
};
