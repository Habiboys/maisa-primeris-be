'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryLog extends Model {
    static associate(models) {
      InventoryLog.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
      InventoryLog.belongsTo(models.Material, { foreignKey: 'material_id', as: 'material' });
    }
  }
  InventoryLog.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id : DataTypes.UUID,
    material_id: DataTypes.UUID,
    unit_no    : DataTypes.STRING(20),
    date       : { type: DataTypes.DATEONLY, allowNull: false },
    qty        : { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    person     : DataTypes.STRING(100),
    type       : { type: DataTypes.ENUM('in','out'), allowNull: false },
    notes      : DataTypes.TEXT,
    created_by : DataTypes.UUID,
  }, { sequelize, modelName: 'InventoryLog', tableName: 'inventory_logs', underscored: true });
  return InventoryLog;
};
