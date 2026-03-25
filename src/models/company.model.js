'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
      Company.hasOne(models.CompanySetting, { foreignKey: 'company_id', as: 'settings' });
    }
  }

  Company.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    domain: { type: DataTypes.STRING(150), allowNull: true, unique: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    subscription_plan: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'basic' },
    billing_cycle: { type: DataTypes.ENUM('monthly', 'yearly'), allowNull: false, defaultValue: 'monthly' },
    subscription_status: {
      type: DataTypes.ENUM('active', 'trial', 'grace', 'inactive', 'suspended', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
    subscription_started_at: { type: DataTypes.DATE, allowNull: true },
    subscription_ended_at: { type: DataTypes.DATE, allowNull: true },
    is_suspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    underscored: true,
  });

  return Company;
};
