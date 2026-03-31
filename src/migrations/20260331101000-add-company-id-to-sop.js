'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      'permintaan_material',
      'tanda_terima_gudang',
      'barang_keluar',
      'inventaris_lapangan',
      'surat_jalan'
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'company_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    // Best-effort data migration to link existing rows to 'company_id' if they have a 'project_id'
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        UPDATE ${table} t
        JOIN projects p ON t.project_id = p.id
        SET t.company_id = p.company_id
        WHERE t.company_id IS NULL AND t.project_id IS NOT NULL;
      `);
    }

    // Data migration explicitly mapping user relations
    await queryInterface.sequelize.query(`
      UPDATE permintaan_material t
      JOIN users u ON t.requested_by = u.id
      SET t.company_id = u.company_id
      WHERE t.company_id IS NULL AND t.requested_by IS NOT NULL;
    `);

    // Only 'barang_keluar' and 'surat_jalan' have issued_by
    await queryInterface.sequelize.query(`
      UPDATE barang_keluar t
      JOIN users u ON t.issued_by = u.id
      SET t.company_id = u.company_id
      WHERE t.company_id IS NULL AND t.issued_by IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE surat_jalan t
      JOIN users u ON t.issued_by = u.id
      SET t.company_id = u.company_id
      WHERE t.company_id IS NULL AND t.issued_by IS NOT NULL;
    `);

    // For tanda_terima_gudang, received_by is a user UUID (if populated properly)
    await queryInterface.sequelize.query(`
      UPDATE tanda_terima_gudang t
      JOIN users u ON t.received_by = u.id
      SET t.company_id = u.company_id
      WHERE t.company_id IS NULL AND t.received_by IS NOT NULL;
    `);

  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      'permintaan_material',
      'tanda_terima_gudang',
      'barang_keluar',
      'inventaris_lapangan',
      'surat_jalan'
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'company_id');
    }
  }
};
