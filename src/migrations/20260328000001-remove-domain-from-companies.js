'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus index unique pada domain terlebih dahulu (jika ada)
    try {
      await queryInterface.removeIndex('companies', ['domain']);
    } catch {
      // Index mungkin tidak ada, skip
    }

    await queryInterface.removeColumn('companies', 'domain');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'domain', {
      type: Sequelize.STRING(150),
      allowNull: true,
      unique: true,
    });
  },
};
