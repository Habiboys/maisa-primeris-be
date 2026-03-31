'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Permintaan Material
    await queryInterface.addColumn('permintaan_material', 'divisi', { type: Sequelize.STRING(100) });

    // Surat Jalan
    await queryInterface.addColumn('surat_jalan', 'dikirim_dengan', { type: Sequelize.STRING(150) });

    // Inventaris Lapangan
    await queryInterface.addColumn('inventaris_lapangan', 'kode', { type: Sequelize.STRING(50) });
    await queryInterface.addColumn('inventaris_lapangan', 'signature_disetujui', { type: Sequelize.STRING(100) });
    await queryInterface.addColumn('inventaris_lapangan', 'signature_diperiksa', { type: Sequelize.STRING(100) });
    await queryInterface.addColumn('inventaris_lapangan', 'signature_logistik', { type: Sequelize.STRING(100) });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventaris_lapangan', 'signature_logistik');
    await queryInterface.removeColumn('inventaris_lapangan', 'signature_diperiksa');
    await queryInterface.removeColumn('inventaris_lapangan', 'signature_disetujui');
    await queryInterface.removeColumn('inventaris_lapangan', 'kode');
    await queryInterface.removeColumn('surat_jalan', 'dikirim_dengan');
    await queryInterface.removeColumn('permintaan_material', 'divisi');
  }
};
