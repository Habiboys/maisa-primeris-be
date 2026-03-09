'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qc_template_sections', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      template_id : { type: Sequelize.UUID, allowNull: false, references: { model: 'qc_templates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name        : { type: Sequelize.STRING(150), allowNull: false },
      order_index : { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('qc_template_sections', ['template_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('qc_template_sections'); },
};
