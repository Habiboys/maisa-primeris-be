'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppjb extends Model {
    static associate(models) {
      Ppjb.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
      Ppjb.belongsTo(models.Consumer,    { foreignKey: 'consumer_id',    as: 'consumer' });
    }
  }
  Ppjb.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    housing_unit_id: DataTypes.UUID,
    consumer_id   : DataTypes.UUID,
    company_id    : DataTypes.UUID,
    nomor_ppjb    : DataTypes.STRING(100),
    tanggal_ppjb  : DataTypes.DATEONLY,
    harga_ppjb    : DataTypes.BIGINT,
    status        : { type: DataTypes.ENUM('Draft','Ditandatangani','Batal'), defaultValue: 'Draft' },
    dokumen_url   : DataTypes.STRING(255),
    notes         : DataTypes.TEXT,
  }, { sequelize, modelName: 'Ppjb', tableName: 'ppjb', underscored: true });
  return Ppjb;
};
