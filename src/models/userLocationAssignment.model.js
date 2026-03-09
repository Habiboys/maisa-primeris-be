'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLocationAssignment extends Model {
    static associate(models) {
      UserLocationAssignment.belongsTo(models.User,         { foreignKey: 'user_id', as: 'user' });
      UserLocationAssignment.belongsTo(models.WorkLocation, { foreignKey: 'work_location_id', as: 'location' });
    }
  }
  UserLocationAssignment.init({
    id              : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id         : { type: DataTypes.UUID, allowNull: false },
    work_location_id: { type: DataTypes.UUID, allowNull: false },
    is_primary      : { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { sequelize, modelName: 'UserLocationAssignment', tableName: 'user_location_assignments', underscored: true });
  return UserLocationAssignment;
};
