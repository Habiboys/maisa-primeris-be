'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkLocation extends Model {
    static associate(models) {
      WorkLocation.hasMany(models.UserLocationAssignment, { foreignKey: 'work_location_id', as: 'assignments' });
      WorkLocation.hasMany(models.Attendance,             { foreignKey: 'work_location_id', as: 'attendances' });
      WorkLocation.hasMany(models.User,                   { foreignKey: 'work_location_id', as: 'users' });
    }
  }
  WorkLocation.init({
    id       : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: DataTypes.UUID,
    name     : { type: DataTypes.STRING(150), allowNull: false },
    address  : DataTypes.TEXT,
    latitude : DataTypes.DECIMAL(10,8),
    longitude: DataTypes.DECIMAL(11,8),
    radius_m : { type: DataTypes.INTEGER, defaultValue: 100 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { sequelize, modelName: 'WorkLocation', tableName: 'work_locations', underscored: true });
  return WorkLocation;
};
