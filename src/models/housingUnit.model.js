'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HousingUnit extends Model {
    static associate(models) {
      HousingUnit.belongsTo(models.Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
      HousingUnit.belongsTo(models.ProjectUnit, { foreignKey: 'project_unit_id', as: 'projectUnit' });
      HousingUnit.hasOne(models.UnitStatus, { foreignKey: 'housing_unit_id', as: 'unitStatus' });
      HousingUnit.hasMany(models.HousingPaymentHistory, { foreignKey: 'housing_unit_id', as: 'payments' });
    }
  }
  HousingUnit.init({
    id               : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    unit_code        : { type: DataTypes.STRING(50), allowNull: false, unique: true },
    company_id       : DataTypes.UUID,
    project_id       : DataTypes.UUID,
    project_unit_id  : DataTypes.UUID,
    unit_type        : DataTypes.STRING(80),
    id_rumah         : DataTypes.STRING(50),
    no_sertifikat    : DataTypes.STRING(100),
    panjang_kanan    : DataTypes.DECIMAL(8, 2),
    panjang_kiri     : DataTypes.DECIMAL(8, 2),
    lebar_depan      : DataTypes.DECIMAL(8, 2),
    lebar_belakang   : DataTypes.DECIMAL(8, 2),
    luas_tanah       : DataTypes.DECIMAL(8,2),
    luas_bangunan    : DataTypes.DECIMAL(8,2),
    harga_per_meter  : DataTypes.BIGINT,
    harga_jual       : DataTypes.BIGINT,
    daya_listrik     : DataTypes.INTEGER,
    consumer_id      : DataTypes.UUID,
    status           : { type: DataTypes.ENUM('Tersedia','Proses','Sold'), defaultValue: 'Tersedia' },
    akad_date        : DataTypes.DATEONLY,
    serah_terima_date: DataTypes.DATEONLY,
    notes            : DataTypes.TEXT,
    photo_url        : DataTypes.STRING(255),
  }, { sequelize, modelName: 'HousingUnit', tableName: 'housing_units', underscored: true });
  return HousingUnit;
};
