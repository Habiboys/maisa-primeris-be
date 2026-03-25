'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('housing_units', 'id_rumah', { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addColumn('housing_units', 'no_sertipikat', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('housing_units', 'panjang_kanan', { type: Sequelize.DECIMAL(8, 2), allowNull: true });
    await queryInterface.addColumn('housing_units', 'panjang_kiri', { type: Sequelize.DECIMAL(8, 2), allowNull: true });
    await queryInterface.addColumn('housing_units', 'lebar_depan', { type: Sequelize.DECIMAL(8, 2), allowNull: true });
    await queryInterface.addColumn('housing_units', 'lebar_belakang', { type: Sequelize.DECIMAL(8, 2), allowNull: true });
    await queryInterface.addColumn('housing_units', 'harga_per_meter', { type: Sequelize.BIGINT, allowNull: true });
    await queryInterface.addColumn('housing_units', 'daya_listrik', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('housing_units', 'photo_url', { type: Sequelize.STRING(255), allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('housing_units', 'photo_url');
    await queryInterface.removeColumn('housing_units', 'daya_listrik');
    await queryInterface.removeColumn('housing_units', 'harga_per_meter');
    await queryInterface.removeColumn('housing_units', 'lebar_belakang');
    await queryInterface.removeColumn('housing_units', 'lebar_depan');
    await queryInterface.removeColumn('housing_units', 'panjang_kiri');
    await queryInterface.removeColumn('housing_units', 'panjang_kanan');
    await queryInterface.removeColumn('housing_units', 'no_sertipikat');
    await queryInterface.removeColumn('housing_units', 'id_rumah');
  },
};
