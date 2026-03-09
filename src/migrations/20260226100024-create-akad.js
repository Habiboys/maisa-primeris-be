'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('akad', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      housing_unit_id : { type: Sequelize.UUID, allowNull: true },
      consumer_id     : { type: Sequelize.UUID, allowNull: true },
      ppjb_id         : { type: Sequelize.UUID, allowNull: true },
      nomor_akad      : { type: Sequelize.STRING(100), allowNull: true },
      tanggal_akad    : { type: Sequelize.DATEONLY, allowNull: true },
      bank            : { type: Sequelize.STRING(80), allowNull: true },
      notaris         : { type: Sequelize.STRING(150), allowNull: true },
      status          : { type: Sequelize.ENUM('Draft','Selesai','Batal'), defaultValue: 'Draft', allowNull: false },
      dokumen_url     : { type: Sequelize.STRING(255), allowNull: true },
      notes           : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('akad'); },
};
