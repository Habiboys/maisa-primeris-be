'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MediaAsset extends Model {
    static associate(models) {
      MediaAsset.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      MediaAsset.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
    }
  }

  MediaAsset.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: true },
    uploaded_by: { type: DataTypes.UUID, allowNull: true },
    category: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'general' },
    original_name: { type: DataTypes.STRING(255), allowNull: true },
    stored_name: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(120), allowNull: false },
    size_bytes: { type: DataTypes.INTEGER, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
  }, {
    sequelize,
    modelName: 'MediaAsset',
    tableName: 'media_assets',
    underscored: true,
  });

  return MediaAsset;
};
