'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermintaanMaterialItem extends Model {
    static associate(models) {
      PermintaanMaterialItem.belongsTo(models.PermintaanMaterial, { foreignKey: 'permintaan_material_id', as: 'permintaan' });
    }
  }
  PermintaanMaterialItem.init({
    id                    : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    permintaan_material_id: { type: DataTypes.UUID, allowNull: false },
    item_name             : { type: DataTypes.STRING(150), allowNull: false },
    unit                  : DataTypes.STRING(30),
    qty_requested         : { type: DataTypes.DECIMAL(10,2), allowNull: false },
    qty_approved          : DataTypes.DECIMAL(10,2),
    notes                 : DataTypes.TEXT,
  }, { sequelize, modelName: 'PermintaanMaterialItem', tableName: 'permintaan_material_items', underscored: true });
  return PermintaanMaterialItem;
};
