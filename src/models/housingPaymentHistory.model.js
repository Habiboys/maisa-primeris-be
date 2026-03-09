'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HousingPaymentHistory extends Model {
    static associate(models) {
      HousingPaymentHistory.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
    }
  }
  HousingPaymentHistory.init({
    id             : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    housing_unit_id: { type: DataTypes.UUID, allowNull: false },
    payment_date   : { type: DataTypes.DATEONLY, allowNull: false },
    amount         : { type: DataTypes.BIGINT, allowNull: false },
    type           : DataTypes.STRING(80),
    description    : DataTypes.TEXT,
    receipt_file   : DataTypes.STRING(255),
  }, { sequelize, modelName: 'HousingPaymentHistory', tableName: 'housing_payment_histories', underscored: true });
  return HousingPaymentHistory;
};
