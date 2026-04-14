'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MeetingNote extends Model {
    static associate(models) {
      MeetingNote.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      MeetingNote.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
      MeetingNote.hasMany(models.MeetingAction, { foreignKey: 'meeting_note_id', as: 'actions' });
    }
  }

  MeetingNote.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    company_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    meeting_type: {
      type: DataTypes.ENUM('Mingguan', 'Bulanan'),
      allowNull: false,
      defaultValue: 'Mingguan',
    },
    participants: { type: DataTypes.TEXT('long'), allowNull: true },
    discussion: { type: DataTypes.TEXT('long'), allowNull: false },
    result: { type: DataTypes.TEXT('long'), allowNull: false },
    created_by: { type: DataTypes.UUID, allowNull: false },
  }, {
    sequelize,
    modelName: 'MeetingNote',
    tableName: 'meeting_notes',
    underscored: true,
  });

  return MeetingNote;
};
