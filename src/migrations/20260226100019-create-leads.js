'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
      id             : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name           : { type: Sequelize.STRING(100), allowNull: false },
      phone          : { type: Sequelize.STRING(20), allowNull: true },
      email          : { type: Sequelize.STRING(150), allowNull: true },
      source         : { type: Sequelize.STRING(80), allowNull: true },
      marketing_id   : { type: Sequelize.UUID, allowNull: true, references: { model: 'marketing_persons', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      project_id     : { type: Sequelize.UUID, allowNull: true },
      interest       : { type: Sequelize.STRING(150), allowNull: true },
      status         : { type: Sequelize.ENUM('Baru','Follow-up','Survey','Negoisasi','Deal','Batal'), defaultValue: 'Baru', allowNull: false },
      notes          : { type: Sequelize.TEXT, allowNull: true },
      follow_up_date : { type: Sequelize.DATEONLY, allowNull: true },
      created_at     : { type: Sequelize.DATE, allowNull: false },
      updated_at     : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('leads', ['marketing_id']);
    await queryInterface.addIndex('leads', ['status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('leads'); },
};
