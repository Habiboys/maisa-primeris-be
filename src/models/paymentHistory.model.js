'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentHistory extends Model {
    static associate(models) {
      PaymentHistory.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
    }
  }
  PaymentHistory.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    consumer_id   : { type: DataTypes.UUID, allowNull: false },
    payment_date  : { type: DataTypes.DATEONLY, allowNull: false },
    amount        : { type: DataTypes.BIGINT, allowNull: false },
    payment_method: DataTypes.STRING(80),
    notes         : DataTypes.TEXT,
    receipt_file  : DataTypes.STRING(255),
  }, { sequelize, modelName: 'PaymentHistory', tableName: 'payment_histories', underscored: true });
  return PaymentHistory;
};
