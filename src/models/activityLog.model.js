'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  ActivityLog.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id    : DataTypes.UUID,
    action     : { type: DataTypes.STRING(100), allowNull: false },
    entity     : DataTypes.STRING(100),
    entity_id  : DataTypes.UUID,
    description: DataTypes.TEXT,
    ip_address : DataTypes.STRING(45),
  }, { sequelize, modelName: 'ActivityLog', tableName: 'activity_logs', underscored: true });
  return ActivityLog;
};
