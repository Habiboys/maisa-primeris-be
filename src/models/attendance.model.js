'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.User,         { foreignKey: 'user_id', as: 'user' });
      Attendance.belongsTo(models.WorkLocation, { foreignKey: 'work_location_id', as: 'location' });
    }
  }
  Attendance.init({
    id              : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id         : { type: DataTypes.UUID, allowNull: false },
    work_location_id: DataTypes.UUID,
    attendance_date : { type: DataTypes.DATEONLY, allowNull: false },
    clock_in        : DataTypes.TIME,
    clock_out       : DataTypes.TIME,
    clock_in_lat    : DataTypes.DECIMAL(10,8),
    clock_in_lng    : DataTypes.DECIMAL(11,8),
    clock_out_lat   : DataTypes.DECIMAL(10,8),
    clock_out_lng   : DataTypes.DECIMAL(11,8),
    clock_in_photo  : DataTypes.STRING(255),
    clock_out_photo : DataTypes.STRING(255),
    status          : { type: DataTypes.ENUM('Hadir','Izin','Sakit','Alpha','Terlambat'), defaultValue: 'Hadir' },
    notes           : DataTypes.TEXT,
  }, { sequelize, modelName: 'Attendance', tableName: 'attendances', underscored: true });
  return Attendance;
};
