'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bast', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      housing_unit_id : { type: Sequelize.UUID, allowNull: true },
      consumer_id     : { type: Sequelize.UUID, allowNull: true },
      akad_id         : { type: Sequelize.UUID, allowNull: true },
      nomor_bast      : { type: Sequelize.STRING(100), allowNull: true },
      tanggal_bast    : { type: Sequelize.DATEONLY, allowNull: true },
      status          : { type: Sequelize.ENUM('Draft','Ditandatangani','Batal'), defaultValue: 'Draft', allowNull: false },
      dokumen_url     : { type: Sequelize.STRING(255), allowNull: true },
      notes           : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('bast'); },
};
