'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PindahUnit extends Model {
    static associate(models) {
      PindahUnit.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
    }
  }
  PindahUnit.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    consumer_id   : DataTypes.UUID,
    unit_lama     : DataTypes.STRING(50),
    unit_baru     : DataTypes.STRING(50),
    tanggal_pindah: DataTypes.DATEONLY,
    alasan        : DataTypes.TEXT,
    selisih_harga : { type: DataTypes.BIGINT, defaultValue: 0 },
    status        : { type: DataTypes.ENUM('Proses','Selesai','Batal'), defaultValue: 'Proses' },
    dokumen_url   : DataTypes.STRING(255),
  }, { sequelize, modelName: 'PindahUnit', tableName: 'pindah_unit', underscored: true });
  return PindahUnit;
};
