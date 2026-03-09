'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_histories', {
      id             : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      consumer_id    : { type: Sequelize.UUID, allowNull: false, references: { model: 'consumers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      payment_date   : { type: Sequelize.DATEONLY, allowNull: false },
      amount         : { type: Sequelize.BIGINT, allowNull: false },
      payment_method : { type: Sequelize.STRING(80), allowNull: true },
      notes          : { type: Sequelize.TEXT, allowNull: true },
      receipt_file   : { type: Sequelize.STRING(255), allowNull: true },
      created_at     : { type: Sequelize.DATE, allowNull: false },
      updated_at     : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('payment_histories', ['consumer_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('payment_histories'); },
};
