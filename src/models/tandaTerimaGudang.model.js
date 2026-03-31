'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TandaTerimaGudang extends Model {
    static associate(models) {
      TandaTerimaGudang.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      TandaTerimaGudang.belongsTo(models.User, { foreignKey: 'received_by', as: 'receiver' });
      TandaTerimaGudang.hasMany(models.TandaTerimaGudangItem, { foreignKey: 'tanda_terima_gudang_id', as: 'items' });
    }
  }
  TandaTerimaGudang.init({
    id          : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id  : DataTypes.UUID,
    nomor       : DataTypes.STRING(50),
    project_id  : DataTypes.UUID,
    received_by : DataTypes.UUID,
    receive_date: { type: DataTypes.DATEONLY, allowNull: false },
    supplier    : DataTypes.STRING(150),
    status      : { type: DataTypes.ENUM('Draft','Selesai'), defaultValue: 'Draft' },
    notes       : DataTypes.TEXT,
    signature_pengirim: DataTypes.STRING(100),
    signature_penerima: DataTypes.STRING(100),
    signature_mengetahui: DataTypes.STRING(100),
  }, { sequelize, modelName: 'TandaTerimaGudang', tableName: 'tanda_terima_gudang', underscored: true });
  return TandaTerimaGudang;
};
