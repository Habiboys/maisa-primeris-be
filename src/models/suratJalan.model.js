'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SuratJalan extends Model {
    static associate(models) {
      SuratJalan.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      SuratJalan.belongsTo(models.User, { foreignKey: 'issued_by', as: 'issuer' });
      SuratJalan.hasMany(models.SuratJalanItem, { foreignKey: 'surat_jalan_id', as: 'items' });
    }
  }
  SuratJalan.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : DataTypes.UUID,
    nomor      : DataTypes.STRING(50),
    project_id : DataTypes.UUID,
    driver_name: DataTypes.STRING(100),
    vehicle_no : DataTypes.STRING(30),
    dikirim_dengan: DataTypes.STRING(150),
    send_date  : { type: DataTypes.DATEONLY, allowNull: false },
    destination: DataTypes.STRING(255),
    issued_by  : DataTypes.UUID,
    status     : { type: DataTypes.ENUM('Draft','Dikirim','Diterima'), defaultValue: 'Draft' },
    notes      : DataTypes.TEXT,
    signature_mengetahui: DataTypes.STRING(100),
    signature_pengemudi: DataTypes.STRING(100),
  }, { sequelize, modelName: 'SuratJalan', tableName: 'surat_jalan', underscored: true });
  return SuratJalan;
};
