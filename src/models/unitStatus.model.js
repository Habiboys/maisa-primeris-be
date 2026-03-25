'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnitStatus extends Model {
    static associate(models) {
      UnitStatus.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
    }
  }
  UnitStatus.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    unit_code  : { type: DataTypes.STRING(50), allowNull: false },
    company_id : DataTypes.UUID,
    project_id : DataTypes.UUID,
    housing_unit_id: DataTypes.UUID,
    status     : { type: DataTypes.ENUM('Tersedia','Indent','Booking','Sold','Batal'), defaultValue: 'Tersedia' },
    consumer_id: DataTypes.UUID,
    price      : DataTypes.BIGINT,
    notes      : DataTypes.TEXT,
  }, { sequelize, modelName: 'UnitStatus', tableName: 'unit_statuses', underscored: true });
  return UnitStatus;
};
