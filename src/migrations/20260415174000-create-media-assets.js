'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media_assets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      category: { type: Sequelize.STRING(80), allowNull: false, defaultValue: 'general' },
      original_name: { type: Sequelize.STRING(255), allowNull: true },
      stored_name: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(120), allowNull: false },
      size_bytes: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER, allowNull: true },
      height: { type: Sequelize.INTEGER, allowNull: true },
      file_path: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('media_assets', ['company_id']);
    await queryInterface.addIndex('media_assets', ['uploaded_by']);
    await queryInterface.addIndex('media_assets', ['category']);
    await queryInterface.addIndex('media_assets', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('media_assets');
  },
};
