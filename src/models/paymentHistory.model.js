'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentHistory extends Model {
    static associate(models) {
      PaymentHistory.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
    }
  }
  PaymentHistory.init({
    id               : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    consumer_id      : { type: DataTypes.UUID, allowNull: false },
    payment_date     : { type: DataTypes.DATEONLY, allowNull: false },
    amount           : { type: DataTypes.BIGINT, allowNull: false },
    debit            : { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    credit           : { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    payment_method   : DataTypes.STRING(80),
    notes            : DataTypes.TEXT,
    receipt_file     : DataTypes.STRING(255),
    estimasi_date       : DataTypes.DATEONLY,
    status              : DataTypes.STRING(50),
    transaction_name    : DataTypes.STRING(255),
    transaction_category: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Debit' },
    category          : DataTypes.STRING(100),  // Booking Fee, Angsuran, Pelunasan, Refund, Lainnya/custom
  }, { sequelize, modelName: 'PaymentHistory', tableName: 'payment_histories', underscored: true });
  return PaymentHistory;
};
