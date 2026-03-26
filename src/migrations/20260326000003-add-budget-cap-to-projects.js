'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'projects';
    const t = await queryInterface.describeTable(table);
    if (t.budget_cap) return;

    await queryInterface.addColumn(table, 'budget_cap', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    await queryInterface.addIndex(table, ['budget_cap'], {
      name: 'projects_budget_cap_idx',
    });
  },

  async down(queryInterface) {
    const table = 'projects';
    const t = await queryInterface.describeTable(table);
    if (!t.budget_cap) return;
    await queryInterface.removeIndex(table, 'projects_budget_cap_idx').catch(() => {});
    await queryInterface.removeColumn(table, 'budget_cap');
  },
};

