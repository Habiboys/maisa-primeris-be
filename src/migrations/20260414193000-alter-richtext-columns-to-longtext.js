'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('meeting_notes', 'participants', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });

    await queryInterface.changeColumn('meeting_notes', 'discussion', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });

    await queryInterface.changeColumn('meeting_notes', 'result', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });

    await queryInterface.changeColumn('logbooks', 'description', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('meeting_notes', 'participants', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('meeting_notes', 'discussion', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('meeting_notes', 'result', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('logbooks', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
