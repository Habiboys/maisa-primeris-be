'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consumer extends Model {
    static associate(models) {
      Consumer.hasMany(models.PaymentHistory, { foreignKey: 'consumer_id', as: 'payments' });
      Consumer.hasMany(models.HousingUnit,    { foreignKey: 'consumer_id', as: 'housingUnits' });
    }
  }
  Consumer.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name          : { type: DataTypes.STRING(100), allowNull: false },
    nik           : DataTypes.STRING(20),
    phone         : DataTypes.STRING(20),
    email         : DataTypes.STRING(150),
    address       : DataTypes.TEXT,
    unit_code     : DataTypes.STRING(50),
    project_id    : DataTypes.UUID,
    total_price   : DataTypes.BIGINT,
    paid_amount   : { type: DataTypes.BIGINT, defaultValue: 0 },
    payment_scheme: DataTypes.STRING(80),
    status        : { type: DataTypes.ENUM('Aktif','Lunas','Dibatalkan'), defaultValue: 'Aktif' },
  }, { sequelize, modelName: 'Consumer', tableName: 'consumers', underscored: true });
  return Consumer;
};
