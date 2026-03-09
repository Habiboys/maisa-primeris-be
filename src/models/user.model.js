'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.ActivityLog,              { foreignKey: 'user_id', as: 'activityLogs' });
      User.hasMany(models.WorkLog,                  { foreignKey: 'reported_by', as: 'workLogs' });
      User.hasMany(models.QcSubmission,             { foreignKey: 'submitted_by', as: 'qcSubmissions' });
      User.hasMany(models.Transaction,              { foreignKey: 'created_by', as: 'transactions' });
      User.hasMany(models.UserLocationAssignment,   { foreignKey: 'user_id', as: 'locationAssignments' });
      User.hasMany(models.Attendance,               { foreignKey: 'user_id', as: 'attendances' });
      User.hasMany(models.LeaveRequest,             { foreignKey: 'user_id', as: 'leaveRequests' });
      User.hasMany(models.LeaveRequest,             { foreignKey: 'approved_by', as: 'approvedLeaves' });
      User.hasMany(models.PermintaanMaterial,       { foreignKey: 'requested_by', as: 'permintaanMaterial' });
      User.hasMany(models.TandaTerimaGudang,        { foreignKey: 'received_by', as: 'tandaTerimaGudang' });
      User.hasMany(models.BarangKeluar,             { foreignKey: 'issued_by', as: 'barangKeluar' });
      User.hasMany(models.SuratJalan,               { foreignKey: 'issued_by', as: 'suratJalan' });
      User.hasMany(models.MarketingPerson,          { foreignKey: 'user_id', as: 'marketingProfile' });
      User.belongsTo(models.WorkLocation,           { foreignKey: 'work_location_id', as: 'workLocation' });
    }
  }
  User.init({
    id            : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name          : { type: DataTypes.STRING(100), allowNull: false },
    email         : { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password      : { type: DataTypes.STRING(255), allowNull: false },
    role          : { type: DataTypes.ENUM('Super Admin','Finance','Project Management'), defaultValue: 'Finance' },
    status        : { type: DataTypes.ENUM('Aktif','Nonaktif'), defaultValue: 'Aktif' },
    phone         : DataTypes.STRING(20),
    avatar        : DataTypes.STRING(255),
    work_location_id: DataTypes.UUID,
    last_login    : DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  });
  return User;
};
