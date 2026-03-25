'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AttendanceSetting extends Model {}

  AttendanceSetting.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: true },
    work_start_time: { type: DataTypes.TIME, allowNull: false, defaultValue: '08:00:00' },
    work_end_time: { type: DataTypes.TIME, allowNull: false, defaultValue: '17:00:00' },
    late_grace_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'AttendanceSetting',
    tableName: 'attendance_settings',
    underscored: true,
  });

  return AttendanceSetting;
};
