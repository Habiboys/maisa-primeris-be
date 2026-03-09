'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qc_template_items', {
      id          : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      section_id  : { type: Sequelize.UUID, allowNull: false, references: { model: 'qc_template_sections', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      description : { type: Sequelize.TEXT, allowNull: false },
      order_index : { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at  : { type: Sequelize.DATE, allowNull: false },
      updated_at  : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('qc_template_items', ['section_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('qc_template_items'); },
};
