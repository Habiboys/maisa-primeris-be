'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HousingUnit extends Model {
    static associate(models) {
      HousingUnit.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
      HousingUnit.hasMany(models.HousingPaymentHistory, { foreignKey: 'housing_unit_id', as: 'payments' });
    }
  }
  HousingUnit.init({
    id               : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    unit_code        : { type: DataTypes.STRING(50), allowNull: false, unique: true },
    project_id       : DataTypes.UUID,
    unit_type        : DataTypes.STRING(80),
    luas_tanah       : DataTypes.DECIMAL(8,2),
    luas_bangunan    : DataTypes.DECIMAL(8,2),
    harga_jual       : DataTypes.BIGINT,
    consumer_id      : DataTypes.UUID,
    status           : { type: DataTypes.ENUM('Tersedia','Proses','Sold'), defaultValue: 'Tersedia' },
    akad_date        : DataTypes.DATEONLY,
    serah_terima_date: DataTypes.DATEONLY,
    notes            : DataTypes.TEXT,
  }, { sequelize, modelName: 'HousingUnit', tableName: 'housing_units', underscored: true });
  return HousingUnit;
};
