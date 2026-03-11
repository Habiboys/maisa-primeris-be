'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkLog extends Model {
    static associate(models) {
      WorkLog.belongsTo(models.Project,     { foreignKey: 'project_id', as: 'project' });
      WorkLog.belongsTo(models.ProjectUnit, { foreignKey: 'unit_id', as: 'unit' });
      WorkLog.belongsTo(models.User,        { foreignKey: 'reported_by', as: 'reporter' });
      WorkLog.hasMany(models.WorkLogPhoto,  { foreignKey: 'work_log_id', as: 'photos' });
    }
  }
  WorkLog.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id    : DataTypes.UUID,
    unit_id       : DataTypes.UUID,
    unit_no       : DataTypes.STRING(20),
    reported_by   : DataTypes.UUID,
    date          : { type: DataTypes.DATEONLY, allowNull: false },
    activity      : { type: DataTypes.TEXT, allowNull: false },
    worker_count  : DataTypes.INTEGER,
    progress_added: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
    status        : { type: DataTypes.ENUM('Normal','Lembur','Kendala'), defaultValue: 'Normal' },
    weather       : DataTypes.STRING(50),
  }, { sequelize, modelName: 'WorkLog', tableName: 'work_logs', underscored: true });
  return WorkLog;
};
