'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('housing_payment_histories', {
      id             : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      housing_unit_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'housing_units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      payment_date   : { type: Sequelize.DATEONLY, allowNull: false },
      amount         : { type: Sequelize.BIGINT, allowNull: false },
      type           : { type: Sequelize.STRING(80), allowNull: true },
      description    : { type: Sequelize.TEXT, allowNull: true },
      receipt_file   : { type: Sequelize.STRING(255), allowNull: true },
      created_at     : { type: Sequelize.DATE, allowNull: false },
      updated_at     : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('housing_payment_histories', ['housing_unit_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('housing_payment_histories'); },
};
