'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventarisLapangan extends Model {
    static associate(models) {
      InventarisLapangan.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  }
  InventarisLapangan.init({
    id        : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: DataTypes.UUID,
    project_id: DataTypes.UUID,
    kode      : DataTypes.STRING(50),
    item_name : { type: DataTypes.STRING(150), allowNull: false },
    category  : DataTypes.STRING(80),
    unit      : DataTypes.STRING(30),
    qty       : { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    condition : { type: DataTypes.ENUM('Baik','Rusak Ringan','Rusak Berat','Hilang'), defaultValue: 'Baik' },
    location  : DataTypes.STRING(150),
    last_check: DataTypes.DATEONLY,
    notes     : DataTypes.TEXT,
    photo_url : DataTypes.STRING(255),
    signature_disetujui: DataTypes.STRING(100),
    signature_diperiksa: DataTypes.STRING(100),
    signature_logistik : DataTypes.STRING(100),
  }, { sequelize, modelName: 'InventarisLapangan', tableName: 'inventaris_lapangan', underscored: true });
  return InventarisLapangan;
};
