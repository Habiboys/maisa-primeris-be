'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryLog extends Model {
    static associate(models) {
      InventoryLog.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
    }
  }
  InventoryLog.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id : DataTypes.UUID,
    unit_no    : DataTypes.STRING(20),
    date       : { type: DataTypes.DATEONLY, allowNull: false },
    item       : { type: DataTypes.STRING(200), allowNull: false },
    qty        : { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    unit_satuan: DataTypes.STRING(30),
    person     : DataTypes.STRING(100),
    type       : { type: DataTypes.ENUM('in','out'), allowNull: false },
    notes      : DataTypes.TEXT,
    // legacy fields (kept for backward compatibility)
    category   : DataTypes.STRING(80),
    qty_in     : { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    qty_out    : { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    qty_balance: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    log_date   : DataTypes.DATEONLY,
    item_name  : DataTypes.STRING(150),
    unit       : DataTypes.STRING(30),
    created_by : DataTypes.UUID,
  }, { sequelize, modelName: 'InventoryLog', tableName: 'inventory_logs', underscored: true });
  return InventoryLog;
};
