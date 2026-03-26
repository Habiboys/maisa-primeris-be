'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'company_settings';
    const t = await queryInterface.describeTable(table);
    if (t.favicon_url) return;

    await queryInterface.addColumn(table, 'favicon_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addIndex(table, ['favicon_url'], {
      name: 'company_settings_favicon_url_idx',
    }).catch(() => {});
  },

  async down(queryInterface) {
    const table = 'company_settings';
    const t = await queryInterface.describeTable(table);
    if (!t.favicon_url) return;
    await queryInterface.removeIndex(table, 'company_settings_favicon_url_idx').catch(() => {});
    await queryInterface.removeColumn(table, 'favicon_url');
  },
};

