'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pembatalan', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      consumer_id     : { type: Sequelize.UUID, allowNull: true },
      unit_code       : { type: Sequelize.STRING(50), allowNull: true },
      tanggal_batal   : { type: Sequelize.DATEONLY, allowNull: true },
      alasan          : { type: Sequelize.TEXT, allowNull: true },
      refund_amount   : { type: Sequelize.BIGINT, defaultValue: 0 },
      status          : { type: Sequelize.ENUM('Proses','Selesai'), defaultValue: 'Proses', allowNull: false },
      dokumen_url     : { type: Sequelize.STRING(255), allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('pembatalan'); },
};
