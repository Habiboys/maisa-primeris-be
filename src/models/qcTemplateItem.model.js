'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QcTemplateItem extends Model {
    static associate(models) {
      QcTemplateItem.belongsTo(models.QcTemplateSection, { foreignKey: 'section_id', as: 'section' });
      QcTemplateItem.hasMany(models.QcSubmissionResult,  { foreignKey: 'item_id', as: 'results' });
    }
  }
  QcTemplateItem.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    section_id : { type: DataTypes.UUID, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'QcTemplateItem', tableName: 'qc_template_items', underscored: true });
  return QcTemplateItem;
};
