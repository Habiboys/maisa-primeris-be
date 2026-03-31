'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Permintaan Material
    await queryInterface.addColumn('permintaan_material', 'signature_disetujui', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('permintaan_material', 'signature_diperiksa', { type: Sequelize.STRING(100), allowNull: true });
    
    // Barang Keluar
    await queryInterface.addColumn('barang_keluar', 'signature_disetujui', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('barang_keluar', 'signature_diperiksa', { type: Sequelize.STRING(100), allowNull: true });
    
    // Tanda Terima Gudang
    await queryInterface.addColumn('tanda_terima_gudang', 'signature_pengirim', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('tanda_terima_gudang', 'signature_penerima', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('tanda_terima_gudang', 'signature_mengetahui', { type: Sequelize.STRING(100), allowNull: true });
    
    // Surat Jalan
    await queryInterface.addColumn('surat_jalan', 'signature_mengetahui', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('surat_jalan', 'signature_pengemudi', { type: Sequelize.STRING(100), allowNull: true });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('permintaan_material', 'signature_disetujui');
    await queryInterface.removeColumn('permintaan_material', 'signature_diperiksa');
    
    await queryInterface.removeColumn('barang_keluar', 'signature_disetujui');
    await queryInterface.removeColumn('barang_keluar', 'signature_diperiksa');
    
    await queryInterface.removeColumn('tanda_terima_gudang', 'signature_pengirim');
    await queryInterface.removeColumn('tanda_terima_gudang', 'signature_penerima');
    await queryInterface.removeColumn('tanda_terima_gudang', 'signature_mengetahui');
    
    await queryInterface.removeColumn('surat_jalan', 'signature_mengetahui');
    await queryInterface.removeColumn('surat_jalan', 'signature_pengemudi');
  }
};
