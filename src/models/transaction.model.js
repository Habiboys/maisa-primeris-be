'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
      Transaction.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
    }
  }
  Transaction.init({
    id              : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    type            : { type: DataTypes.ENUM('Pemasukan','Pengeluaran'), allowNull: false },
    category        : DataTypes.STRING(100),
    description     : DataTypes.TEXT,
    amount          : { type: DataTypes.BIGINT, allowNull: false },
    payment_method  : DataTypes.STRING(80),
    reference_no    : DataTypes.STRING(100),
    attachment      : DataTypes.STRING(255),
    project_id      : DataTypes.UUID,
    housing_unit_id : DataTypes.UUID,
    company_id      : DataTypes.UUID,
    created_by      : DataTypes.UUID,
  }, { sequelize, modelName: 'Transaction', tableName: 'transactions', underscored: true });
  return Transaction;
};
