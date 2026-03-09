'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QcTemplateSection extends Model {
    static associate(models) {
      QcTemplateSection.belongsTo(models.QcTemplate,    { foreignKey: 'template_id', as: 'template' });
      QcTemplateSection.hasMany(models.QcTemplateItem,  { foreignKey: 'section_id', as: 'items' });
    }
  }
  QcTemplateSection.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    template_id: { type: DataTypes.UUID, allowNull: false },
    name       : { type: DataTypes.STRING(150), allowNull: false },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'QcTemplateSection', tableName: 'qc_template_sections', underscored: true });
  return QcTemplateSection;
};
