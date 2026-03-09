'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id              : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name            : { type: Sequelize.STRING(150), allowNull: false },
      location        : { type: Sequelize.STRING(255), allowNull: true },
      total_units     : { type: Sequelize.INTEGER, defaultValue: 0 },
      qc_template_id  : { type: Sequelize.UUID, allowNull: true, references: { model: 'qc_templates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      start_date      : { type: Sequelize.DATEONLY, allowNull: true },
      end_date        : { type: Sequelize.DATEONLY, allowNull: true },
      status          : { type: Sequelize.ENUM('Aktif','Selesai','Ditunda'), defaultValue: 'Aktif', allowNull: false },
      description     : { type: Sequelize.TEXT, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('projects', ['status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('projects'); },
};
