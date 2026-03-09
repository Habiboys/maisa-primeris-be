'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akad extends Model {
    static associate(models) {
      Akad.belongsTo(models.HousingUnit, { foreignKey: 'housing_unit_id', as: 'housingUnit' });
      Akad.belongsTo(models.Consumer,    { foreignKey: 'consumer_id',    as: 'consumer' });
      Akad.belongsTo(models.Ppjb,        { foreignKey: 'ppjb_id',        as: 'ppjb' });
    }
  }
  Akad.init({
    id             : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    housing_unit_id: DataTypes.UUID,
    consumer_id    : DataTypes.UUID,
    ppjb_id        : DataTypes.UUID,
    nomor_akad     : DataTypes.STRING(100),
    tanggal_akad   : DataTypes.DATEONLY,
    bank           : DataTypes.STRING(80),
    notaris        : DataTypes.STRING(150),
    status         : { type: DataTypes.ENUM('Draft','Selesai','Batal'), defaultValue: 'Draft' },
    dokumen_url    : DataTypes.STRING(255),
    notes          : DataTypes.TEXT,
  }, { sequelize, modelName: 'Akad', tableName: 'akad', underscored: true });
  return Akad;
};
