'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Logbook extends Model {
    static associate(models) {
      Logbook.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      Logbook.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Logbook.belongsTo(models.JobCategory, { foreignKey: 'job_category_id', as: 'jobCategory' });
      Logbook.hasMany(models.LogbookFile, { foreignKey: 'logbook_id', as: 'files' });
    }
  }

  Logbook.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    job_category_id: { type: DataTypes.UUID, allowNull: false },
    description: { type: DataTypes.TEXT('long'), allowNull: false },
    progress: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM('Draft', 'Submitted', 'Reviewed'),
      allowNull: false,
      defaultValue: 'Draft',
    },
  }, {
    sequelize,
    modelName: 'Logbook',
    tableName: 'logbooks',
    underscored: true,
  });

  return Logbook;
};
