'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnitStatus extends Model {
    static associate(_models) {}
  }
  UnitStatus.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    unit_code  : { type: DataTypes.STRING(50), allowNull: false },
    project_id : DataTypes.UUID,
    status     : { type: DataTypes.ENUM('Tersedia','Indent','Booking','Sold','Batal'), defaultValue: 'Tersedia' },
    consumer_id: DataTypes.UUID,
    price      : DataTypes.BIGINT,
    notes      : DataTypes.TEXT,
  }, { sequelize, modelName: 'UnitStatus', tableName: 'unit_statuses', underscored: true });
  return UnitStatus;
};
