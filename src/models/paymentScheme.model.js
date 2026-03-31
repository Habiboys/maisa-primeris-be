'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentScheme extends Model {
    static associate(/* models */) {
      // No associations needed for now
    }
  }
  PaymentScheme.init({
    id          : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name        : { type: DataTypes.STRING(100), allowNull: false },
    description : DataTypes.TEXT,
    company_id  : DataTypes.UUID,
  }, { sequelize, modelName: 'PaymentScheme', tableName: 'payment_schemes', underscored: true });
  return PaymentScheme;
};
