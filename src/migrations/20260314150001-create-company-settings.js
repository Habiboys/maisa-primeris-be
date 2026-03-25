'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      app_name: { type: Sequelize.STRING(150), allowNull: false, defaultValue: 'Maisa Primeris App' },
      logo_url: { type: Sequelize.STRING(255), allowNull: true },
      primary_color: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '#2563eb' },
      secondary_color: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '#14b8a6' },
      accent_color: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '#f59e0b' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('company_settings', ['company_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('company_settings');
  },
};
