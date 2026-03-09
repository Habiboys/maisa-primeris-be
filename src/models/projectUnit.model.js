'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectUnit extends Model {
    static associate(models) {
      ProjectUnit.belongsTo(models.Project,            { foreignKey: 'project_id', as: 'project' });
      ProjectUnit.belongsTo(models.ConstructionStatus, { foreignKey: 'construction_status_id', as: 'constructionStatus' });
      ProjectUnit.belongsTo(models.QcTemplate,         { foreignKey: 'qc_template_id', as: 'qcTemplate' });
      ProjectUnit.hasMany(models.WorkLog,              { foreignKey: 'unit_id', as: 'workLogs' });
      ProjectUnit.hasMany(models.QcSubmission,         { foreignKey: 'unit_id', as: 'qcSubmissions' });
    }
  }
  ProjectUnit.init({
    id                    : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id            : { type: DataTypes.UUID, allowNull: false },
    no                    : { type: DataTypes.STRING(50), allowNull: false },
    tipe                  : DataTypes.STRING(50),
    progress              : { type: DataTypes.INTEGER, defaultValue: 0 },
    status                : DataTypes.STRING(100),
    qc_status             : { type: DataTypes.ENUM('Pass', 'Fail', 'Ongoing'), defaultValue: 'Ongoing' },
    qc_readiness          : { type: DataTypes.INTEGER, defaultValue: 0 },
    construction_status_id: DataTypes.UUID,
    qc_template_id        : DataTypes.UUID,
    notes                 : DataTypes.TEXT,
  }, { sequelize, modelName: 'ProjectUnit', tableName: 'project_units', underscored: true });
  return ProjectUnit;
};
