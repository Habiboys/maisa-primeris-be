'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QcTemplate extends Model {
    static associate(models) {
      QcTemplate.hasMany(models.QcTemplateSection, { foreignKey: 'template_id', as: 'sections' });
      QcTemplate.hasMany(models.ProjectUnit,        { foreignKey: 'qc_template_id', as: 'units' });
      QcTemplate.hasMany(models.QcSubmission,       { foreignKey: 'template_id', as: 'submissions' });
    }
  }
  QcTemplate.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : DataTypes.UUID,
    name       : { type: DataTypes.STRING(150), allowNull: false },
    description: DataTypes.TEXT,
    is_active  : { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { sequelize, modelName: 'QcTemplate', tableName: 'qc_templates', underscored: true });
  return QcTemplate;
};
