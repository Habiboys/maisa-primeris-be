'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkLogPhoto extends Model {
    static associate(models) {
      WorkLogPhoto.belongsTo(models.WorkLog, { foreignKey: 'work_log_id', as: 'workLog' });
    }
  }
  WorkLogPhoto.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    work_log_id: { type: DataTypes.UUID, allowNull: false },
    photo_url  : { type: DataTypes.STRING(255), allowNull: false },
    caption    : DataTypes.STRING(255),
  }, { sequelize, modelName: 'WorkLogPhoto', tableName: 'work_log_photos', underscored: true });
  return WorkLogPhoto;
};
