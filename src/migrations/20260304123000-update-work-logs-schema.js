"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "work_logs";
    const t = await queryInterface.describeTable(table);

    if (t.work_date) {
      await queryInterface.renameColumn(table, "work_date", "date");
    }
    if (t.description) {
      await queryInterface.renameColumn(table, "description", "activity");
    }
    if (t.workers) {
      await queryInterface.renameColumn(table, "workers", "worker_count");
    }

    const addIfMissing = async (name, definition) => {
      const current = await queryInterface.describeTable(table);
      if (!current[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    await addIfMissing("progress_added", { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 });
    await addIfMissing("status", { type: Sequelize.ENUM("Normal", "Lembur", "Kendala"), allowNull: false, defaultValue: "Normal" });
    await addIfMissing("unit_no", { type: Sequelize.STRING(20) });
  },

  async down(queryInterface, Sequelize) {
    const table = "work_logs";
    const t = await queryInterface.describeTable(table);

    const dropIfExists = async (name) => {
      const current = await queryInterface.describeTable(table);
      if (current[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };

    await dropIfExists("unit_no");
    await dropIfExists("status");
    await dropIfExists("progress_added");

    const current = await queryInterface.describeTable(table);
    if (current.worker_count && !current.workers) {
      await queryInterface.renameColumn(table, "worker_count", "workers");
    }
    if (current.activity && !current.description) {
      await queryInterface.renameColumn(table, "activity", "description");
    }
    if (current.date && !current.work_date) {
      await queryInterface.renameColumn(table, "date", "work_date");
    }
  },
};
