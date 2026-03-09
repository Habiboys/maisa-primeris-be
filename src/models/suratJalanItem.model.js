'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SuratJalanItem extends Model {
    static associate(models) {
      SuratJalanItem.belongsTo(models.SuratJalan, { foreignKey: 'surat_jalan_id', as: 'suratJalan' });
    }
  }
  SuratJalanItem.init({
    id           : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    surat_jalan_id: { type: DataTypes.UUID, allowNull: false },
    item_name    : { type: DataTypes.STRING(150), allowNull: false },
    unit         : DataTypes.STRING(30),
    qty          : { type: DataTypes.DECIMAL(10,2), allowNull: false },
    notes        : DataTypes.TEXT,
  }, { sequelize, modelName: 'SuratJalanItem', tableName: 'surat_jalan_items', underscored: true });
  return SuratJalanItem;
};
