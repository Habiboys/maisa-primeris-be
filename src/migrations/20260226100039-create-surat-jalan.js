'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('surat_jalan', {
      id           : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      nomor        : { type: Sequelize.STRING(50), allowNull: true },
      project_id   : { type: Sequelize.UUID, allowNull: true },
      driver_name  : { type: Sequelize.STRING(100), allowNull: true },
      vehicle_no   : { type: Sequelize.STRING(30), allowNull: true },
      send_date    : { type: Sequelize.DATEONLY, allowNull: false },
      destination  : { type: Sequelize.STRING(255), allowNull: true },
      issued_by    : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      status       : { type: Sequelize.ENUM('Draft','Dikirim','Diterima'), defaultValue: 'Draft', allowNull: false },
      notes        : { type: Sequelize.TEXT, allowNull: true },
      created_at   : { type: Sequelize.DATE, allowNull: false },
      updated_at   : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('surat_jalan', ['project_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('surat_jalan'); },
};
