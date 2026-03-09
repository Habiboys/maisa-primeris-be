"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "project_units";
    const t = await queryInterface.describeTable(table);
    if (t.unit_code) {
      await queryInterface.renameColumn(table, "unit_code", "no");
    }
    if (t.unit_type) {
      await queryInterface.renameColumn(table, "unit_type", "tipe");
    }

    const addIfMissing = async (name, definition) => {
      const current = await queryInterface.describeTable(table);
      if (!current[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    await addIfMissing("progress", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await addIfMissing("status", { type: Sequelize.STRING(100) });
    await addIfMissing("qc_status", { type: Sequelize.ENUM("Pass", "Fail", "Ongoing"), allowNull: false, defaultValue: "Ongoing" });
    await addIfMissing("qc_readiness", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
  },

  async down(queryInterface, Sequelize) {
    const table = "project_units";
    const dropIfExists = async (name) => {
      const current = await queryInterface.describeTable(table);
      if (current[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };
    await dropIfExists("qc_readiness");
    await dropIfExists("qc_status");
    await dropIfExists("status");
    await dropIfExists("progress");

    const current = await queryInterface.describeTable(table);
    if (current.no && !current.unit_code) {
      await queryInterface.renameColumn(table, "no", "unit_code");
    }
    if (current.tipe && !current.unit_type) {
      await queryInterface.renameColumn(table, "tipe", "unit_type");
    }
  },
};
