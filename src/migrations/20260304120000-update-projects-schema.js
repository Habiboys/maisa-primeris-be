"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // rename total_units -> units_count
    const table = "projects";
    const t = await queryInterface.describeTable(table);
    if (t.total_units) {
      await queryInterface.renameColumn(table, "total_units", "units_count");
    }
    // add columns if not exist
    const addIfMissing = async (name, definition) => {
      const current = await queryInterface.describeTable(table);
      if (!current[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    await addIfMissing("type", { type: Sequelize.ENUM("cluster", "standalone"), allowNull: false, defaultValue: "cluster" });
    await addIfMissing("progress", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await addIfMissing("deadline", { type: Sequelize.STRING(50) });
    await addIfMissing("lead", { type: Sequelize.STRING(100) });
    await addIfMissing("construction_status", { type: Sequelize.STRING(100) });

    // update status enum to match README
    if (t.status) {
      await queryInterface.changeColumn(table, "status", {
        type: Sequelize.ENUM("On Progress", "Completed", "Delayed"),
        allowNull: false,
        defaultValue: "On Progress",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = "projects";
    const t = await queryInterface.describeTable(table);
    // revert status enum
    if (t.status) {
      await queryInterface.changeColumn(table, "status", {
        type: Sequelize.ENUM("Aktif", "Selesai", "Ditunda"),
        allowNull: false,
        defaultValue: "Aktif",
      });
    }
    // drop added columns
    const dropIfExists = async (name) => {
      const current = await queryInterface.describeTable(table);
      if (current[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };
    await dropIfExists("construction_status");
    await dropIfExists("lead");
    await dropIfExists("deadline");
    await dropIfExists("progress");
    await dropIfExists("type");
    // rename back units_count -> total_units
    const current = await queryInterface.describeTable(table);
    if (current.units_count && !current.total_units) {
      await queryInterface.renameColumn(table, "units_count", "total_units");
    }
  },
};
