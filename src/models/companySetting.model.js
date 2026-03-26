'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanySetting extends Model {
    static associate(models) {
      CompanySetting.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  }

  CompanySetting.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    app_name: { type: DataTypes.STRING(150), allowNull: false, defaultValue: 'Maisa Primeris App' },
    logo_url: { type: DataTypes.STRING(255), allowNull: true },
    favicon_url: { type: DataTypes.STRING(255), allowNull: true },
    primary_color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#2563eb' },
    secondary_color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#14b8a6' },
    accent_color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#f59e0b' },
  }, {
    sequelize,
    modelName: 'CompanySetting',
    tableName: 'company_settings',
    underscored: true,
  });

  return CompanySetting;
};
