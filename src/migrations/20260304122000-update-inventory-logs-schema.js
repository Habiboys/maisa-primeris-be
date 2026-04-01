"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "inventory_logs";
    const addIfMissing = async (name, definition) => {
      const current = await queryInterface.describeTable(table);
      if (!current[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    // Align columns to README: unit_no, date, item, qty, unit_satuan, person, type ('in'|'out')
    await addIfMissing("unit_no", { type: Sequelize.STRING(20) });
    await addIfMissing("date", { type: Sequelize.DATEONLY, allowNull: false });
    await addIfMissing("item", { type: Sequelize.STRING(200), allowNull: false });
    await addIfMissing("qty", { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
    await addIfMissing("unit_satuan", { type: Sequelize.STRING(30) });
    await addIfMissing("person", { type: Sequelize.STRING(100) });

    // adjust type enum to in|out
    const t = await queryInterface.describeTable(table);
    if (t.type) {
      await queryInterface.changeColumn(table, "type", {
        type: Sequelize.ENUM("in", "out"),
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = "inventory_logs";
    const dropIfExists = async (name) => {
      const current = await queryInterface.describeTable(table);
      if (current[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };
    await dropIfExists("person");
    await dropIfExists("unit_satuan");
    await dropIfExists("qty");
    await dropIfExists("item");
    await dropIfExists("date");
    await dropIfExists("unit_no");

    const t = await queryInterface.describeTable(table);
    if (t.type) {
      await queryInterface.changeColumn(table, "type", {
        type: Sequelize.ENUM("masuk", "keluar"),
        allowNull: false,
      });
    }
  },
};
