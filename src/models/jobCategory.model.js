'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JobCategory extends Model {
    static associate(models) {
      JobCategory.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      JobCategory.hasMany(models.Logbook, { foreignKey: 'job_category_id', as: 'logbooks' });
    }
  }

  JobCategory.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
  }, {
    sequelize,
    modelName: 'JobCategory',
    tableName: 'job_categories',
    underscored: true,
  });

  return JobCategory;
};
