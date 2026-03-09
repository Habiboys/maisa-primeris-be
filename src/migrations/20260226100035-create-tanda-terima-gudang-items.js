'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tanda_terima_gudang_items', {
      id                    : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      tanda_terima_gudang_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'tanda_terima_gudang', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      item_name             : { type: Sequelize.STRING(150), allowNull: false },
      unit                  : { type: Sequelize.STRING(30), allowNull: true },
      qty_ordered           : { type: Sequelize.DECIMAL(10,2), allowNull: true },
      qty_received          : { type: Sequelize.DECIMAL(10,2), allowNull: false },
      condition             : { type: Sequelize.ENUM('Baik','Rusak','Kurang'), defaultValue: 'Baik' },
      notes                 : { type: Sequelize.TEXT, allowNull: true },
      created_at            : { type: Sequelize.DATE, allowNull: false },
      updated_at            : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('tanda_terima_gudang_items', ['tanda_terima_gudang_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('tanda_terima_gudang_items'); },
};
