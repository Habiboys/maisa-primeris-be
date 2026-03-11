'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('work_logs');

    // Add unit_no
    if (!tableDescription.unit_no) {
      await queryInterface.addColumn('work_logs', 'unit_no', {
        type: Sequelize.STRING(20),
        allowNull: true,
        after: 'unit_id',
      });
    }

    // Add date (new canonical column)
    if (!tableDescription.date) {
      await queryInterface.addColumn('work_logs', 'date', {
        type: Sequelize.DATEONLY,
        allowNull: true,
        after: 'unit_no',
      });
    }

    // Add activity (new canonical column)
    if (!tableDescription.activity) {
      await queryInterface.addColumn('work_logs', 'activity', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'date',
      });
    }

    // Add worker_count
    if (!tableDescription.worker_count) {
      await queryInterface.addColumn('work_logs', 'worker_count', {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'activity',
      });
    }

    // Add progress_added
    if (!tableDescription.progress_added) {
      await queryInterface.addColumn('work_logs', 'progress_added', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        after: 'worker_count',
      });
    }

    // Add status ENUM
    if (!tableDescription.status) {
      await queryInterface.addColumn('work_logs', 'status', {
        type: Sequelize.ENUM('Normal', 'Lembur', 'Kendala'),
        allowNull: true,
        defaultValue: 'Normal',
        after: 'progress_added',
      });
    }

    // Add index on new date column
    try {
      await queryInterface.addIndex('work_logs', ['date'], { name: 'work_logs_date_idx' });
    } catch (_) {
      // index may already exist
    }
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable('work_logs');
    if (tableDescription.status)         await queryInterface.removeColumn('work_logs', 'status');
    if (tableDescription.progress_added) await queryInterface.removeColumn('work_logs', 'progress_added');
    if (tableDescription.worker_count)   await queryInterface.removeColumn('work_logs', 'worker_count');
    if (tableDescription.activity)       await queryInterface.removeColumn('work_logs', 'activity');
    if (tableDescription.date)           await queryInterface.removeColumn('work_logs', 'date');
    if (tableDescription.unit_no)        await queryInterface.removeColumn('work_logs', 'unit_no');
  },
};
