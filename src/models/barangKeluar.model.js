'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BarangKeluar extends Model {
    static associate(models) {
      BarangKeluar.belongsTo(models.User, { foreignKey: 'issued_by', as: 'issuer' });
      BarangKeluar.hasMany(models.BarangKeluarItem, { foreignKey: 'barang_keluar_id', as: 'items' });
    }
  }
  BarangKeluar.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomor      : DataTypes.STRING(50),
    project_id : DataTypes.UUID,
    issued_by  : DataTypes.UUID,
    issue_date : { type: DataTypes.DATEONLY, allowNull: false },
    received_by: DataTypes.STRING(100),
    status     : { type: DataTypes.ENUM('Draft','Selesai'), defaultValue: 'Draft' },
    notes      : DataTypes.TEXT,
  }, { sequelize, modelName: 'BarangKeluar', tableName: 'barang_keluar', underscored: true });
  return BarangKeluar;
};
