'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConstructionStatus extends Model {
    static associate(models) {
      ConstructionStatus.hasMany(models.ProjectUnit, { foreignKey: 'construction_status_id', as: 'units' });
    }
  }
  ConstructionStatus.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : DataTypes.UUID,
    name       : { type: DataTypes.STRING(100), allowNull: false },
    color      : DataTypes.STRING(20),
    progress   : { type: DataTypes.INTEGER, defaultValue: 0 },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'ConstructionStatus', tableName: 'construction_statuses', underscored: true });
  return ConstructionStatus;
};
