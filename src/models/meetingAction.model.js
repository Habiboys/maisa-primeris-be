'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MeetingAction extends Model {
    static associate(models) {
      MeetingAction.belongsTo(models.MeetingNote, { foreignKey: 'meeting_note_id', as: 'meetingNote' });
      MeetingAction.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
    }
  }

  MeetingAction.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    meeting_note_id: { type: DataTypes.UUID, allowNull: false },
    task: { type: DataTypes.TEXT, allowNull: false },
    assigned_to: { type: DataTypes.UUID, allowNull: true },
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
  }, {
    sequelize,
    modelName: 'MeetingAction',
    tableName: 'meeting_actions',
    underscored: true,
  });

  return MeetingAction;
};
