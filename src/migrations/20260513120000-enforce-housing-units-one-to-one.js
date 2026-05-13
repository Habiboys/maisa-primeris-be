'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Backfill: hapus housing_units yang dangling (project_unit_id NULL atau pointing ke baris yang tidak ada).
    //    Tanpa langkah ini, kolom NOT NULL & UNIQUE di langkah 2 akan gagal.
    await queryInterface.sequelize.query(`
      DELETE h FROM housing_units h
      LEFT JOIN project_units p ON p.id = h.project_unit_id
      WHERE h.project_unit_id IS NULL OR p.id IS NULL;
    `);

    // 2) Jika ada duplikat project_unit_id (seharusnya tidak, tapi defensive), sisakan 1 baris terbaru per project_unit.
    await queryInterface.sequelize.query(`
      DELETE h FROM housing_units h
      JOIN (
        SELECT project_unit_id, MAX(updated_at) AS max_updated
        FROM housing_units
        GROUP BY project_unit_id
        HAVING COUNT(*) > 1
      ) dup ON dup.project_unit_id = h.project_unit_id
      WHERE h.updated_at < dup.max_updated;
    `);

    // 3) Drop FK lama supaya kolom & onDelete bisa diubah.
    //    Sequelize generate nama FK seperti `housing_units_ibfk_<n>`; cari & drop secara dinamis.
    const [fks] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'housing_units'
        AND COLUMN_NAME = 'project_unit_id'
        AND REFERENCED_TABLE_NAME = 'project_units';
    `);
    for (const fk of fks) {
      await queryInterface.sequelize.query(
        `ALTER TABLE housing_units DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\`;`
      );
    }

    // 4) Ubah project_unit_id jadi NOT NULL.
    await queryInterface.changeColumn('housing_units', 'project_unit_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    // 5) Tambah UNIQUE constraint pada project_unit_id (1-to-1).
    //    Drop dulu non-unique index dari migrasi 20260319000010 agar tidak duplikat.
    await queryInterface.removeIndex('housing_units', ['project_unit_id']).catch(() => {});
    await queryInterface.addConstraint('housing_units', {
      fields: ['project_unit_id'],
      type: 'unique',
      name: 'housing_units_project_unit_id_unique',
    });

    // 6) Re-create FK dengan ON DELETE CASCADE.
    await queryInterface.addConstraint('housing_units', {
      fields: ['project_unit_id'],
      type: 'foreign key',
      name: 'housing_units_project_unit_id_fkey',
      references: { table: 'project_units', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 7) Drop unique index pada unit_code (auto-generated saat createTable dengan unique: true).
    //    MySQL menamai index ini sesuai nama kolom; coba beberapa kemungkinan.
    for (const name of ['unit_code', 'housing_units_unit_code_key', 'housing_units_unit_code']) {
      try { await queryInterface.removeIndex('housing_units', name); } catch (_) { /* skip */ }
    }

    // 8) Drop kolom redundan.
    await queryInterface.removeColumn('housing_units', 'unit_code');
    await queryInterface.removeColumn('housing_units', 'unit_type');
  },

  async down(queryInterface, Sequelize) {
    // Tambah balik kolom (data lama tidak akan kembali).
    await queryInterface.addColumn('housing_units', 'unit_type', {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn('housing_units', 'unit_code', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Backfill unit_code & unit_type dari project_units (sebagai best-effort).
    await queryInterface.sequelize.query(`
      UPDATE housing_units h
      JOIN project_units p ON p.id = h.project_unit_id
      SET h.unit_code = p.no, h.unit_type = p.tipe;
    `);

    // Set unit_code NOT NULL + UNIQUE seperti sebelum migrasi.
    await queryInterface.changeColumn('housing_units', 'unit_code', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    });

    // Lepas FK CASCADE & UNIQUE constraint.
    await queryInterface
      .removeConstraint('housing_units', 'housing_units_project_unit_id_fkey')
      .catch(() => {});
    await queryInterface
      .removeConstraint('housing_units', 'housing_units_project_unit_id_unique')
      .catch(() => {});

    // Allow NULL kembali.
    await queryInterface.changeColumn('housing_units', 'project_unit_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Re-create FK SET NULL seperti semula.
    await queryInterface.addIndex('housing_units', ['project_unit_id']);
    await queryInterface.addConstraint('housing_units', {
      fields: ['project_unit_id'],
      type: 'foreign key',
      name: 'housing_units_project_unit_id_fkey',
      references: { table: 'project_units', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
