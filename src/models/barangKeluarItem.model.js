'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BarangKeluarItem extends Model {
    static associate(models) {
      BarangKeluarItem.belongsTo(models.BarangKeluar, { foreignKey: 'barang_keluar_id', as: 'barangKeluar' });
    }
  }
  BarangKeluarItem.init({
    id             : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    barang_keluar_id: { type: DataTypes.UUID, allowNull: false },
    item_name      : { type: DataTypes.STRING(150), allowNull: false },
    unit           : DataTypes.STRING(30),
    qty            : { type: DataTypes.DECIMAL(10,2), allowNull: false },
    notes          : DataTypes.TEXT,
  }, { sequelize, modelName: 'BarangKeluarItem', tableName: 'barang_keluar_items', underscored: true });
  return BarangKeluarItem;
};
