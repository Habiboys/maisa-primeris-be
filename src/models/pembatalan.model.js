'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pembatalan extends Model {
    static associate(models) {
      Pembatalan.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
      Pembatalan.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
    }
  }
  Pembatalan.init({
    id              : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    consumer_id     : DataTypes.UUID,
    housing_unit_id : DataTypes.UUID,
    unit_code       : DataTypes.STRING(50),
    company_id      : DataTypes.UUID,
    tanggal_batal : DataTypes.DATEONLY,
    alasan        : DataTypes.TEXT,
    refund_amount : { type: DataTypes.BIGINT, defaultValue: 0 },
    status        : { type: DataTypes.ENUM('Proses','Selesai'), defaultValue: 'Proses' },
    dokumen_url   : DataTypes.STRING(255),
  }, { sequelize, modelName: 'Pembatalan', tableName: 'pembatalan', underscored: true });
  return Pembatalan;
};
