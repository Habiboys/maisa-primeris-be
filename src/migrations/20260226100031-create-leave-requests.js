'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leave_requests', {
      id            : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      user_id       : { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type          : { type: Sequelize.ENUM('Cuti','Izin','Sakit'), allowNull: false },
      start_date    : { type: Sequelize.DATEONLY, allowNull: false },
      end_date      : { type: Sequelize.DATEONLY, allowNull: false },
      reason        : { type: Sequelize.TEXT, allowNull: true },
      attachment    : { type: Sequelize.STRING(255), allowNull: true },
      status        : { type: Sequelize.ENUM('Menunggu','Disetujui','Ditolak'), defaultValue: 'Menunggu', allowNull: false },
      approved_by   : { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      approved_at   : { type: Sequelize.DATE, allowNull: true },
      created_at    : { type: Sequelize.DATE, allowNull: false },
      updated_at    : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('leave_requests', ['user_id']);
    await queryInterface.addIndex('leave_requests', ['status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('leave_requests'); },
};
