'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      Lead.belongsTo(models.MarketingPerson, { foreignKey: 'marketing_id', as: 'marketingPerson' });
      Lead.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
    }
  }
  Lead.init({
    id              : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name            : { type: DataTypes.STRING(100), allowNull: false },
    phone           : DataTypes.STRING(20),
    email           : DataTypes.STRING(150),
    source          : DataTypes.STRING(80),
    marketing_id    : DataTypes.UUID,
    project_id      : DataTypes.UUID,
    housing_unit_id : DataTypes.UUID,
    interest        : DataTypes.STRING(150),
    status       : { type: DataTypes.ENUM('Baru','Follow-up','Survey','Negoisasi','Deal','Batal'), defaultValue: 'Baru' },
    notes        : DataTypes.TEXT,
    follow_up_date: DataTypes.DATEONLY,
  }, { sequelize, modelName: 'Lead', tableName: 'leads', underscored: true });
  return Lead;
};
