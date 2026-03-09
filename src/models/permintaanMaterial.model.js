'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermintaanMaterial extends Model {
    static associate(models) {
      PermintaanMaterial.belongsTo(models.User, { foreignKey: 'requested_by', as: 'requester' });
      PermintaanMaterial.hasMany(models.PermintaanMaterialItem, { foreignKey: 'permintaan_material_id', as: 'items' });
    }
  }
  PermintaanMaterial.init({
    id          : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomor       : DataTypes.STRING(50),
    project_id  : DataTypes.UUID,
    requested_by: DataTypes.UUID,
    request_date: { type: DataTypes.DATEONLY, allowNull: false },
    status      : { type: DataTypes.ENUM('Draft','Diajukan','Disetujui','Ditolak','Selesai'), defaultValue: 'Draft' },
    notes       : DataTypes.TEXT,
  }, { sequelize, modelName: 'PermintaanMaterial', tableName: 'permintaan_material', underscored: true });
  return PermintaanMaterial;
};
