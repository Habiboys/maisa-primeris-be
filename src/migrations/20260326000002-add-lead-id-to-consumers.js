'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'consumers';
    const t = await queryInterface.describeTable(table);
    if (t.lead_id) return;

    await queryInterface.addColumn(table, 'lead_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'leads', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(`
      UPDATE consumers c
      INNER JOIN leads l ON l.consumer_id = c.id
      SET c.lead_id = l.id
      WHERE c.lead_id IS NULL
    `);

    await queryInterface.addIndex(table, ['lead_id'], {
      name: 'consumers_lead_id_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    const table = 'consumers';
    const t = await queryInterface.describeTable(table);
    if (!t.lead_id) return;
    await queryInterface.removeIndex(table, 'consumers_lead_id_unique').catch(() => {});
    await queryInterface.removeColumn(table, 'lead_id');
  },
};
