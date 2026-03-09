'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QcSubmissionResult extends Model {
    static associate(models) {
      QcSubmissionResult.belongsTo(models.QcSubmission, { foreignKey: 'submission_id', as: 'submission' });
      QcSubmissionResult.belongsTo(models.QcTemplateItem, { foreignKey: 'item_id', as: 'templateItem' });
    }
  }
  QcSubmissionResult.init({
    id           : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submission_id: { type: DataTypes.UUID, allowNull: false },
    item_id      : DataTypes.UUID,
    result       : DataTypes.ENUM('OK','Not OK','N/A'),
    notes        : DataTypes.TEXT,
    photo_url    : DataTypes.STRING(255),
  }, { sequelize, modelName: 'QcSubmissionResult', tableName: 'qc_submission_results', underscored: true });
  return QcSubmissionResult;
};
