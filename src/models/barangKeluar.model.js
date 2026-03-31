'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BarangKeluar extends Model {
    static associate(models) {
      BarangKeluar.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      BarangKeluar.belongsTo(models.User, { foreignKey: 'issued_by', as: 'issuer' });
      BarangKeluar.belongsTo(models.Project, { foreignKey: 'project_id', as: 'projectModel' });
      BarangKeluar.hasMany(models.BarangKeluarItem, { foreignKey: 'barang_keluar_id', as: 'items' });
    }
  }
  BarangKeluar.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id : DataTypes.UUID,
    nomor      : DataTypes.STRING(50),
    project_id : DataTypes.UUID,
    issued_by  : DataTypes.UUID,
    issue_date : { type: DataTypes.DATEONLY, allowNull: false },
    received_by: DataTypes.STRING(100),
    status     : { type: DataTypes.ENUM('Draft','Selesai'), defaultValue: 'Draft' },
    notes      : DataTypes.TEXT,
    signature_disetujui: DataTypes.STRING(100),
    signature_diperiksa: DataTypes.STRING(100),
  }, { sequelize, modelName: 'BarangKeluar', tableName: 'barang_keluar', underscored: true });
  return BarangKeluar;
};
