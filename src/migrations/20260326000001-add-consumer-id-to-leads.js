'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'leads';
    const t = await queryInterface.describeTable(table);
    if (t.consumer_id) return;

    await queryInterface.addColumn(table, 'consumer_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'consumers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex(table, ['consumer_id'], {
      name: 'leads_consumer_id_idx',
    });
  },

  async down(queryInterface) {
    const table = 'leads';
    const t = await queryInterface.describeTable(table);
    if (!t.consumer_id) return;
    await queryInterface.removeIndex(table, 'leads_consumer_id_idx').catch(() => {});
    await queryInterface.removeColumn(table, 'consumer_id');
  },
};
