'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TimeScheduleItem extends Model {
    static associate(_models) {}
  }
  TimeScheduleItem.init({
    id          : { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ref_type    : { type: DataTypes.ENUM('project','project_unit'), allowNull: false },
    ref_id      : { type: DataTypes.UUID, allowNull: false },
    urutan      : DataTypes.INTEGER,
    week_label  : DataTypes.STRING(50),
    activity    : { type: DataTypes.STRING(255), allowNull: false },
    biaya       : { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
    elevasi     : DataTypes.STRING(50),
    plan_start  : DataTypes.DATEONLY,
    plan_end    : DataTypes.DATEONLY,
    actual_start: DataTypes.DATEONLY,
    actual_end  : DataTypes.DATEONLY,
    progress    : { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
    bobot       : DataTypes.DECIMAL(5,2),
    bulan1      : DataTypes.JSON,
    bulan2      : DataTypes.JSON,
    bulan3      : DataTypes.JSON,
    bulan4      : DataTypes.JSON,
    keterangan  : DataTypes.STRING(500),
  }, { sequelize, modelName: 'TimeScheduleItem', tableName: 'time_schedule_items', underscored: true });
  return TimeScheduleItem;
};
