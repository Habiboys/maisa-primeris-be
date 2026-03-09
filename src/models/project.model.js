'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.QcTemplate,      { foreignKey: 'qc_template_id', as: 'qcTemplate' });
      Project.hasMany(models.ProjectUnit,        { foreignKey: 'project_id', as: 'units' });
      Project.hasMany(models.WorkLog,            { foreignKey: 'project_id', as: 'workLogs' });
      Project.hasMany(models.InventoryLog,       { foreignKey: 'project_id', as: 'inventoryLogs' });
      Project.hasMany(models.QcSubmission,       { foreignKey: 'project_id', as: 'qcSubmissions' });
      Project.hasMany(models.PermintaanMaterial, { foreignKey: 'project_id', as: 'permintaanMaterial' });
      Project.hasMany(models.TandaTerimaGudang,  { foreignKey: 'project_id', as: 'tandaTerimaGudang' });
      Project.hasMany(models.BarangKeluar,       { foreignKey: 'project_id', as: 'barangKeluar' });
      Project.hasMany(models.InventarisLapangan, { foreignKey: 'project_id', as: 'inventarisLapangan' });
      Project.hasMany(models.SuratJalan,         { foreignKey: 'project_id', as: 'suratJalan' });
    }
  }
  Project.init({
    id                 : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name               : { type: DataTypes.STRING(150), allowNull: false },
    type               : { type: DataTypes.ENUM('cluster', 'standalone'), allowNull: false, defaultValue: 'cluster' },
    location           : DataTypes.STRING(255),
    units_count        : { type: DataTypes.INTEGER, defaultValue: 0 },
    progress           : { type: DataTypes.INTEGER, defaultValue: 0 },
    status             : { type: DataTypes.ENUM('On Progress', 'Completed', 'Delayed'), defaultValue: 'On Progress' },
    deadline           : DataTypes.STRING(50),
    lead               : DataTypes.STRING(100),
    qc_template_id     : DataTypes.UUID,
    construction_status: DataTypes.STRING(100),
    start_date         : DataTypes.DATEONLY,
    end_date           : DataTypes.DATEONLY,
    description        : DataTypes.TEXT,
  }, { sequelize, modelName: 'Project', tableName: 'projects', underscored: true });
  return Project;
};
