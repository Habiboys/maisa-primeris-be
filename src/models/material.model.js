'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      Material.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      Material.hasMany(models.InventoryLog, { foreignKey: 'material_id', as: 'inventoryLogs' });
    }
  }
  Material.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : { type: DataTypes.UUID, allowNull: false },
    name       : { type: DataTypes.STRING(150), allowNull: false },
    unit       : { type: DataTypes.STRING(50), allowNull: false },
    notes      : DataTypes.TEXT,
  }, { sequelize, modelName: 'Material', tableName: 'materials', underscored: true });
  return Material;
};
