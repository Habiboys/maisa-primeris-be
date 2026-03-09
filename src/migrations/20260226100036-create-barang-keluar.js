'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('barang_keluar', {
      id           : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      nomor        : { type: Sequelize.STRING(50), allowNull: true },
      project_id   : { type: Sequelize.UUID, allowNull: true },
      issued_by    : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      issue_date   : { type: Sequelize.DATEONLY, allowNull: false },
      received_by  : { type: Sequelize.STRING(100), allowNull: true },
      status       : { type: Sequelize.ENUM('Draft','Selesai'), defaultValue: 'Draft', allowNull: false },
      notes        : { type: Sequelize.TEXT, allowNull: true },
      created_at   : { type: Sequelize.DATE, allowNull: false },
      updated_at   : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('barang_keluar', ['project_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('barang_keluar'); },
};
