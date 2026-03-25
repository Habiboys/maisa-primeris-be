'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('users', ['company_id']);

    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('Platform Owner','Super Admin','Finance','Project Management')
      NOT NULL DEFAULT 'Finance'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = 'Super Admin'
      WHERE role = 'Platform Owner'
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('Super Admin','Finance','Project Management')
      NOT NULL DEFAULT 'Finance'
    `);

    await queryInterface.removeIndex('users', ['company_id']);
    await queryInterface.removeColumn('users', 'company_id');
  },
};
