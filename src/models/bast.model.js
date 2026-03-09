'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bast extends Model {
    static associate(models) {
      Bast.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
      Bast.belongsTo(models.Consumer,    { foreignKey: 'consumer_id',    as: 'consumer' });
      Bast.belongsTo(models.Akad,        { foreignKey: 'akad_id',        as: 'akad' });
    }
  }
  Bast.init({
    id             : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    housing_unit_id: DataTypes.UUID,
    consumer_id    : DataTypes.UUID,
    akad_id        : DataTypes.UUID,
    nomor_bast     : DataTypes.STRING(100),
    tanggal_bast   : DataTypes.DATEONLY,
    status         : { type: DataTypes.ENUM('Draft','Ditandatangani','Batal'), defaultValue: 'Draft' },
    dokumen_url    : DataTypes.STRING(255),
    notes          : DataTypes.TEXT,
  }, { sequelize, modelName: 'Bast', tableName: 'bast', underscored: true });
  return Bast;
};
