'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type        : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey  : true,
        allowNull   : false,
      },
      name    : { type: Sequelize.STRING(100), allowNull: false },
      email   : { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role    : {
        type        : Sequelize.ENUM('Super Admin','Finance','Project Management'),
        allowNull   : false,
        defaultValue: 'Finance',
      },
      status: {
        type        : Sequelize.ENUM('Aktif','Nonaktif'),
        allowNull   : false,
        defaultValue: 'Aktif',
      },
      phone           : { type: Sequelize.STRING(20), allowNull: true },
      avatar          : { type: Sequelize.STRING(255), allowNull: true },
      work_location_id: { type: Sequelize.UUID, allowNull: true },
      last_login      : { type: Sequelize.DATE, allowNull: true },
      created_at      : { type: Sequelize.DATE, allowNull: false },
      updated_at      : { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
