'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      Department.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  }
  Department.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : { type: DataTypes.UUID, allowNull: false },
    name       : { type: DataTypes.STRING(150), allowNull: false },
    description: DataTypes.TEXT,
  }, { sequelize, modelName: 'Department', tableName: 'departments', underscored: true });
  return Department;
};
