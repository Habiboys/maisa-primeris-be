'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'inventory_logs';
    await queryInterface.sequelize.query(`SET @OLD_SQL_MODE = @@SQL_MODE`);
    await queryInterface.sequelize.query(`
      SET SQL_MODE = REPLACE(REPLACE(@@SQL_MODE, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '')
    `);
    const current = await queryInterface.describeTable(table);

    if (!current.material_id) {
      await queryInterface.addColumn(table, 'material_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'materials', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      await queryInterface.addIndex(table, ['material_id']);
    }

    // Backfill relasi material_id dari legacy nama material, scoped by company.
    // Catatan: gunakan LOWER + TRIM untuk memperbesar kemungkinan match.
    await queryInterface.sequelize.query(`
      UPDATE inventory_logs il
      JOIN projects p ON p.id = il.project_id
      JOIN materials m
        ON m.company_id = p.company_id
       AND LOWER(TRIM(m.name)) COLLATE utf8mb4_general_ci = LOWER(TRIM(COALESCE(il.item, il.item_name, ''))) COLLATE utf8mb4_general_ci
      SET il.material_id = m.id
      WHERE il.material_id IS NULL
    `);

    // Normalize legacy invalid zero-date values before ALTER TABLE operations.
    // MySQL strict mode can fail while dropping columns if table still contains '0000-00-00'.
    await queryInterface.sequelize.query(`
      UPDATE inventory_logs
      SET date = COALESCE(
        NULLIF(log_date, '0000-00-00'),
        DATE(created_at),
        CURDATE()
      )
      WHERE date IS NULL OR date = '0000-00-00'
    `);

    await queryInterface.sequelize.query(`
      UPDATE inventory_logs
      SET log_date = COALESCE(
        NULLIF(date, '0000-00-00'),
        DATE(created_at),
        CURDATE()
      )
      WHERE log_date = '0000-00-00'
    `);

    const dropIfExists = async (name) => {
      const tbl = await queryInterface.describeTable(table);
      if (tbl[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };

    // Hapus kolom redundant/legacy: info material kini dari tabel materials.
    await dropIfExists('item');
    await dropIfExists('item_name');
    await dropIfExists('unit');
    await dropIfExists('unit_satuan');
    await dropIfExists('category');
    await dropIfExists('qty_in');
    await dropIfExists('qty_out');
    await dropIfExists('qty_balance');
    await dropIfExists('log_date');

    await queryInterface.sequelize.query(`SET SQL_MODE = @OLD_SQL_MODE`);
  },

  async down(queryInterface, Sequelize) {
    const table = 'inventory_logs';
    const current = await queryInterface.describeTable(table);

    const addIfMissing = async (name, definition) => {
      const tbl = await queryInterface.describeTable(table);
      if (!tbl[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    await addIfMissing('item', { type: Sequelize.STRING(200), allowNull: true });
    await addIfMissing('item_name', { type: Sequelize.STRING(150), allowNull: true });
    await addIfMissing('unit', { type: Sequelize.STRING(30), allowNull: true });
    await addIfMissing('unit_satuan', { type: Sequelize.STRING(30), allowNull: true });
    await addIfMissing('category', { type: Sequelize.STRING(80), allowNull: true });
    await addIfMissing('qty_in', { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 });
    await addIfMissing('qty_out', { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 });
    await addIfMissing('qty_balance', { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 });
    await addIfMissing('log_date', { type: Sequelize.DATEONLY, allowNull: true });

    if (current.material_id) {
      await queryInterface.removeIndex(table, ['material_id']).catch(() => {});
      await queryInterface.removeColumn(table, 'material_id');
    }
  },
};
