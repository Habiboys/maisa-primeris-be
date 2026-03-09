'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QcSubmission extends Model {
    static associate(models) {
      QcSubmission.belongsTo(models.Project,     { foreignKey: 'project_id', as: 'project' });
      QcSubmission.belongsTo(models.ProjectUnit, { foreignKey: 'unit_id', as: 'unit' });
      QcSubmission.belongsTo(models.QcTemplate,  { foreignKey: 'template_id', as: 'template' });
      QcSubmission.belongsTo(models.User,        { foreignKey: 'submitted_by', as: 'submitter' });
      QcSubmission.hasMany(models.QcSubmissionResult, { foreignKey: 'submission_id', as: 'results' });
    }
  }
  QcSubmission.init({
    id             : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id     : DataTypes.UUID,
    unit_id        : DataTypes.UUID,
    template_id    : DataTypes.UUID,
    submitted_by   : DataTypes.UUID,
    submission_date: { type: DataTypes.DATEONLY, allowNull: false },
    status         : { type: DataTypes.ENUM('Draft','Submitted','Approved','Rejected'), defaultValue: 'Draft' },
    notes          : DataTypes.TEXT,
  }, { sequelize, modelName: 'QcSubmission', tableName: 'qc_submissions', underscored: true });
  return QcSubmission;
};
