'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('housing_units', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      unit_code       : { type: Sequelize.STRING(50), allowNull: false, unique: true },
      project_id      : { type: Sequelize.UUID, allowNull: true },
      unit_type       : { type: Sequelize.STRING(80), allowNull: true },
      luas_tanah      : { type: Sequelize.DECIMAL(8,2), allowNull: true },
      luas_bangunan   : { type: Sequelize.DECIMAL(8,2), allowNull: true },
      harga_jual      : { type: Sequelize.BIGINT, allowNull: true },
      consumer_id     : { type: Sequelize.UUID, allowNull: true },
      status          : { type: Sequelize.ENUM('Tersedia','Proses','Sold'), defaultValue: 'Tersedia', allowNull: false },
      akad_date       : { type: Sequelize.DATEONLY, allowNull: true },
      serah_terima_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes           : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('housing_units', ['project_id']);
    await queryInterface.addIndex('housing_units', ['consumer_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('housing_units'); },
};
