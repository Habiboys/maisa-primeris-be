'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventaris_lapangan', {
      id            : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      project_id    : { type: Sequelize.UUID, allowNull: true },
      item_name     : { type: Sequelize.STRING(150), allowNull: false },
      category      : { type: Sequelize.STRING(80), allowNull: true },
      unit          : { type: Sequelize.STRING(30), allowNull: true },
      qty           : { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      condition     : { type: Sequelize.ENUM('Baik','Rusak Ringan','Rusak Berat','Hilang'), defaultValue: 'Baik' },
      location      : { type: Sequelize.STRING(150), allowNull: true },
      last_check    : { type: Sequelize.DATEONLY, allowNull: true },
      notes         : { type: Sequelize.TEXT, allowNull: true },
      photo_url     : { type: Sequelize.STRING(255), allowNull: true },
      created_at    : { type: Sequelize.DATE, allowNull: false },
      updated_at    : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('inventaris_lapangan', ['project_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('inventaris_lapangan'); },
};
