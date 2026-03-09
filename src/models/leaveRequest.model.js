'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaveRequest extends Model {
    static associate(models) {
      LeaveRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      LeaveRequest.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
    }
  }
  LeaveRequest.init({
    id         : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id    : { type: DataTypes.UUID, allowNull: false },
    type       : { type: DataTypes.ENUM('Cuti','Izin','Sakit'), allowNull: false },
    start_date : { type: DataTypes.DATEONLY, allowNull: false },
    end_date   : { type: DataTypes.DATEONLY, allowNull: false },
    reason     : DataTypes.TEXT,
    attachment : DataTypes.STRING(255),
    status     : { type: DataTypes.ENUM('Menunggu','Disetujui','Ditolak'), defaultValue: 'Menunggu' },
    approved_by: DataTypes.UUID,
    approved_at: DataTypes.DATE,
  }, { sequelize, modelName: 'LeaveRequest', tableName: 'leave_requests', underscored: true });
  return LeaveRequest;
};
