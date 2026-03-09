'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarketingPerson extends Model {
    static associate(models) {
      MarketingPerson.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      MarketingPerson.hasMany(models.Lead,   { foreignKey: 'marketing_id', as: 'leads' });
    }
  }
  MarketingPerson.init({
    id       : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id  : DataTypes.UUID,
    name     : { type: DataTypes.STRING(100), allowNull: false },
    phone    : DataTypes.STRING(20),
    email    : DataTypes.STRING(150),
    target   : { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { sequelize, modelName: 'MarketingPerson', tableName: 'marketing_persons', underscored: true });
  return MarketingPerson;
};
