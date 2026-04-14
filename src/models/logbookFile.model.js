'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogbookFile extends Model {
    static associate(models) {
      LogbookFile.belongsTo(models.Logbook, { foreignKey: 'logbook_id', as: 'logbook' });
    }
  }

  LogbookFile.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    logbook_id: { type: DataTypes.UUID, allowNull: false },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: true },
  }, {
    sequelize,
    modelName: 'LogbookFile',
    tableName: 'logbook_files',
    underscored: true,
  });

  return LogbookFile;
};
