'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop unique index on name if exists
    // MySQL index name is usually 'construction_statuses_name_unique' or similar
    // Try drop by column if index name unknown
    try {
      await queryInterface.removeIndex('construction_statuses', ['name']);
    } catch (e) {
      // ignore if not exists
    }
    // Add unique index on (company_id, name)
    await queryInterface.addIndex('construction_statuses', ['company_id', 'name'], {
      unique: true,
      name: 'construction_statuses_companyid_name_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the composite unique index
    await queryInterface.removeIndex('construction_statuses', 'construction_statuses_companyid_name_unique');
    // Re-add unique index on name only (not recommended, but for rollback)
    await queryInterface.addIndex('construction_statuses', ['name'], {
      unique: true,
      name: 'construction_statuses_name_unique',
    });
  },
};
