'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      transaction_date: { type: Sequelize.DATEONLY, allowNull: false },
      type            : { type: Sequelize.ENUM('Pemasukan','Pengeluaran'), allowNull: false },
      category        : { type: Sequelize.STRING(100), allowNull: true },
      description     : { type: Sequelize.TEXT, allowNull: true },
      amount          : { type: Sequelize.BIGINT, allowNull: false },
      payment_method  : { type: Sequelize.STRING(80), allowNull: true },
      reference_no    : { type: Sequelize.STRING(100), allowNull: true },
      attachment      : { type: Sequelize.STRING(255), allowNull: true },
      project_id      : { type: Sequelize.UUID, allowNull: true },
      created_by      : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('transactions', ['transaction_date']);
    await queryInterface.addIndex('transactions', ['type']);
  },
  async down(queryInterface) { await queryInterface.dropTable('transactions'); },
};
