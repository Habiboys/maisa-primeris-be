'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambah relasi ke project_units
    await queryInterface.addColumn('housing_units', 'project_unit_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'project_units', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('housing_units', ['project_unit_id']);

    // Rename kolom no_sertipikat → no_sertifikat
    const tableInfo = await queryInterface.describeTable('housing_units');
    if (tableInfo.no_sertipikat) {
      await queryInterface.renameColumn('housing_units', 'no_sertipikat', 'no_sertifikat');
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('housing_units', ['project_unit_id']).catch(() => {});
    await queryInterface.removeColumn('housing_units', 'project_unit_id');
    // Kembalikan nama kolom jika ada
    const tableInfo = await queryInterface.describeTable('housing_units');
    if (tableInfo.no_sertifikat) {
      await queryInterface.renameColumn('housing_units', 'no_sertifikat', 'no_sertipikat');
    }
  },
};

