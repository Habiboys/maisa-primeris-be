'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('surat_jalan_items', {
      id           : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      surat_jalan_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'surat_jalan', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      item_name    : { type: Sequelize.STRING(150), allowNull: false },
      unit         : { type: Sequelize.STRING(30), allowNull: true },
      qty          : { type: Sequelize.DECIMAL(10,2), allowNull: false },
      notes        : { type: Sequelize.TEXT, allowNull: true },
      created_at   : { type: Sequelize.DATE, allowNull: false },
      updated_at   : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('surat_jalan_items', ['surat_jalan_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('surat_jalan_items'); },
};
