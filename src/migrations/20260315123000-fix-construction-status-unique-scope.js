'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old global unique index on `name` if exists.
    try {
      await queryInterface.removeIndex('construction_statuses', 'name');
    } catch (_e1) {
      try {
        await queryInterface.removeIndex('construction_statuses', 'name_UNIQUE');
      } catch (_e2) {
        // ignore if index does not exist
      }
    }

    // Add scoped unique index: company_id + name
    await queryInterface.addIndex('construction_statuses', ['company_id', 'name'], {
      name: 'construction_status_company_name_unique',
      unique: true,
    });

    // Keep query performance for tenant list endpoint.
    await queryInterface.addIndex('construction_statuses', ['company_id'], {
      name: 'construction_status_company_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('construction_statuses', 'construction_status_company_name_unique');
    await queryInterface.removeIndex('construction_statuses', 'construction_status_company_idx');

    await queryInterface.addIndex('construction_statuses', ['name'], {
      name: 'name',
      unique: true,
    });
  },
};
