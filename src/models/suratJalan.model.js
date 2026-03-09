'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SuratJalan extends Model {
    static associate(models) {
      SuratJalan.belongsTo(models.User, { foreignKey: 'issued_by', as: 'issuer' });
      SuratJalan.hasMany(models.SuratJalanItem, { foreignKey: 'surat_jalan_id', as: 'items' });
    }
  }
  SuratJalan.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomor      : DataTypes.STRING(50),
    project_id : DataTypes.UUID,
    driver_name: DataTypes.STRING(100),
    vehicle_no : DataTypes.STRING(30),
    send_date  : { type: DataTypes.DATEONLY, allowNull: false },
    destination: DataTypes.STRING(255),
    issued_by  : DataTypes.UUID,
    status     : { type: DataTypes.ENUM('Draft','Dikirim','Diterima'), defaultValue: 'Draft' },
    notes      : DataTypes.TEXT,
  }, { sequelize, modelName: 'SuratJalan', tableName: 'surat_jalan', underscored: true });
  return SuratJalan;
};
