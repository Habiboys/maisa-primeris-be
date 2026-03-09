'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TandaTerimaGudang extends Model {
    static associate(models) {
      TandaTerimaGudang.belongsTo(models.User, { foreignKey: 'received_by', as: 'receiver' });
      TandaTerimaGudang.hasMany(models.TandaTerimaGudangItem, { foreignKey: 'tanda_terima_gudang_id', as: 'items' });
    }
  }
  TandaTerimaGudang.init({
    id          : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomor       : DataTypes.STRING(50),
    project_id  : DataTypes.UUID,
    received_by : DataTypes.UUID,
    receive_date: { type: DataTypes.DATEONLY, allowNull: false },
    supplier    : DataTypes.STRING(150),
    status      : { type: DataTypes.ENUM('Draft','Selesai'), defaultValue: 'Draft' },
    notes       : DataTypes.TEXT,
  }, { sequelize, modelName: 'TandaTerimaGudang', tableName: 'tanda_terima_gudang', underscored: true });
  return TandaTerimaGudang;
};
