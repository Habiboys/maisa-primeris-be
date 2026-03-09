'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_location_assignments', {
      id               : { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      user_id          : { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      work_location_id : { type: Sequelize.UUID, allowNull: false, references: { model: 'work_locations', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      is_primary       : { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at       : { type: Sequelize.DATE, allowNull: false },
      updated_at       : { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('user_location_assignments', ['user_id']);
    await queryInterface.addIndex('user_location_assignments', ['user_id', 'work_location_id'], { unique: true });
  },
  async down(queryInterface) { await queryInterface.dropTable('user_location_assignments'); },
};
