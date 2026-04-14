'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('Platform Owner','Super Admin','Finance','Project Management','Sekretaris')
      NOT NULL DEFAULT 'Finance'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('Platform Owner','Super Admin','Finance','Project Management')
      NOT NULL DEFAULT 'Finance'
    `);
  },
};
