'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pindah_unit', {
      id               : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      consumer_id      : { type: Sequelize.UUID, allowNull: true },
      unit_lama        : { type: Sequelize.STRING(50), allowNull: true },
      unit_baru        : { type: Sequelize.STRING(50), allowNull: true },
      tanggal_pindah   : { type: Sequelize.DATEONLY, allowNull: true },
      alasan           : { type: Sequelize.TEXT, allowNull: true },
      selisih_harga    : { type: Sequelize.BIGINT, defaultValue: 0 },
      status           : { type: Sequelize.ENUM('Proses','Selesai','Batal'), defaultValue: 'Proses', allowNull: false },
      dokumen_url      : { type: Sequelize.STRING(255), allowNull: true },
      created_at       : { type: Sequelize.DATE, allowNull: false },
      updated_at       : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('pindah_unit'); },
};
