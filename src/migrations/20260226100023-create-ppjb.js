'use strict';
// Legal docs – ppjb, akad, bast, pindah_unit, pembatalan are standalone legal records
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ppjb', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      housing_unit_id : { type: Sequelize.UUID, allowNull: true },
      consumer_id     : { type: Sequelize.UUID, allowNull: true },
      nomor_ppjb      : { type: Sequelize.STRING(100), allowNull: true },
      tanggal_ppjb    : { type: Sequelize.DATEONLY, allowNull: true },
      harga_ppjb      : { type: Sequelize.BIGINT, allowNull: true },
      status          : { type: Sequelize.ENUM('Draft','Ditandatangani','Batal'), defaultValue: 'Draft', allowNull: false },
      dokumen_url     : { type: Sequelize.STRING(255), allowNull: true },
      notes           : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('ppjb'); },
};
