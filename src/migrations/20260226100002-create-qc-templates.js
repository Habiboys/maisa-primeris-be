'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qc_templates', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name        : { type: Sequelize.STRING(150), allowNull: false },
      description : { type: Sequelize.TEXT, allowNull: true },
      is_active   : { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('qc_templates'); },
};
