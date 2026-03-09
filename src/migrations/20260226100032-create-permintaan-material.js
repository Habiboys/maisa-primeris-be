'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permintaan_material', {
      id            : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      nomor         : { type: Sequelize.STRING(50), allowNull: true },
      project_id    : { type: Sequelize.UUID, allowNull: true },
      requested_by  : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      request_date  : { type: Sequelize.DATEONLY, allowNull: false },
      status        : { type: Sequelize.ENUM('Draft','Diajukan','Disetujui','Ditolak','Selesai'), defaultValue: 'Draft', allowNull: false },
      notes         : { type: Sequelize.TEXT, allowNull: true },
      created_at    : { type: Sequelize.DATE, allowNull: false },
      updated_at    : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('permintaan_material', ['project_id']);
    await queryInterface.addIndex('permintaan_material', ['status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('permintaan_material'); },
};
