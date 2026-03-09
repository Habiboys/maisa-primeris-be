'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TandaTerimaGudangItem extends Model {
    static associate(models) {
      TandaTerimaGudangItem.belongsTo(models.TandaTerimaGudang, { foreignKey: 'tanda_terima_gudang_id', as: 'tandaTerimaGudang' });
    }
  }
  TandaTerimaGudangItem.init({
    id                    : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tanda_terima_gudang_id: { type: DataTypes.UUID, allowNull: false },
    item_name             : { type: DataTypes.STRING(150), allowNull: false },
    unit                  : DataTypes.STRING(30),
    qty_ordered           : DataTypes.DECIMAL(10,2),
    qty_received          : { type: DataTypes.DECIMAL(10,2), allowNull: false },
    condition             : { type: DataTypes.ENUM('Baik','Rusak','Kurang'), defaultValue: 'Baik' },
    notes                 : DataTypes.TEXT,
  }, { sequelize, modelName: 'TandaTerimaGudangItem', tableName: 'tanda_terima_gudang_items', underscored: true });
  return TandaTerimaGudangItem;
};
