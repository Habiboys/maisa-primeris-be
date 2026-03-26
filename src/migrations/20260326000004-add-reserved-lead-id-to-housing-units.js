'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'housing_units';
    const t = await queryInterface.describeTable(table);
    if (t.reserved_lead_id) return;

    await queryInterface.addColumn(table, 'reserved_lead_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'leads', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Satu lead hanya boleh mengunci maksimal satu unit.
    await queryInterface.addIndex(table, ['reserved_lead_id'], {
      name: 'housing_units_reserved_lead_id_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    const table = 'housing_units';
    const t = await queryInterface.describeTable(table);
    if (!t.reserved_lead_id) return;
    await queryInterface.removeIndex(table, 'housing_units_reserved_lead_id_unique').catch(() => {});
    await queryInterface.removeColumn(table, 'reserved_lead_id');
  },
};

