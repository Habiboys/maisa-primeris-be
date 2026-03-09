'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      id               : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      user_id          : { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      work_location_id : { type: Sequelize.UUID, allowNull: true, references: { model: 'work_locations', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      attendance_date  : { type: Sequelize.DATEONLY, allowNull: false },
      clock_in         : { type: Sequelize.TIME, allowNull: true },
      clock_out        : { type: Sequelize.TIME, allowNull: true },
      clock_in_lat     : { type: Sequelize.DECIMAL(10,8), allowNull: true },
      clock_in_lng     : { type: Sequelize.DECIMAL(11,8), allowNull: true },
      clock_out_lat    : { type: Sequelize.DECIMAL(10,8), allowNull: true },
      clock_out_lng    : { type: Sequelize.DECIMAL(11,8), allowNull: true },
      clock_in_photo   : { type: Sequelize.STRING(255), allowNull: true },
      clock_out_photo  : { type: Sequelize.STRING(255), allowNull: true },
      status           : { type: Sequelize.ENUM('Hadir','Izin','Sakit','Alpha','Terlambat'), defaultValue: 'Hadir', allowNull: false },
      notes            : { type: Sequelize.TEXT, allowNull: true },
      created_at       : { type: Sequelize.DATE, allowNull: false },
      updated_at       : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('attendances', ['user_id', 'attendance_date'], { unique: true });
    await queryInterface.addIndex('attendances', ['attendance_date']);
  },
  async down(queryInterface) { await queryInterface.dropTable('attendances'); },
};
