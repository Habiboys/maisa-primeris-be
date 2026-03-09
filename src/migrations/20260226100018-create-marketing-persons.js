'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('marketing_persons', {
      id         : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      user_id    : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      name       : { type: Sequelize.STRING(100), allowNull: false },
      phone      : { type: Sequelize.STRING(20), allowNull: true },
      email      : { type: Sequelize.STRING(150), allowNull: true },
      target     : { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active  : { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at : { type: Sequelize.DATE, allowNull: false },
      updated_at : { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('marketing_persons'); },
};
