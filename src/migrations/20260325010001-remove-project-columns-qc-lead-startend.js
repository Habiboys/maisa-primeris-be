'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'projects';
    const current = await queryInterface.describeTable(table);

    const dropIfExists = async (name) => {
      if (current[name]) {
        await queryInterface.removeColumn(table, name);
      }
    };

    // Sesuai kebutuhan FE: project tidak lagi punya qc_template_id, lead, start_date, end_date
    await dropIfExists('qc_template_id');
    await dropIfExists('lead');
    await dropIfExists('start_date');
    await dropIfExists('end_date');

    // Pastikan enum status hanya 3 nilai (On Progress / Completed / Delayed)
    const after = await queryInterface.describeTable(table);
    if (after.status) {
      // Backward compatibility: map nilai enum lama ke enum baru
      await queryInterface.sequelize.query(
        `UPDATE projects SET status = 'On Progress' WHERE status = 'Aktif'`
      );
      await queryInterface.sequelize.query(
        `UPDATE projects SET status = 'Completed' WHERE status = 'Selesai'`
      );
      await queryInterface.sequelize.query(
        `UPDATE projects SET status = 'Delayed' WHERE status = 'Ditunda'`
      );

      await queryInterface.changeColumn(table, 'status', {
        type: Sequelize.ENUM('On Progress', 'Completed', 'Delayed'),
        allowNull: false,
        defaultValue: 'On Progress',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'projects';
    const current = await queryInterface.describeTable(table);

    const addIfMissing = async (name, definition) => {
      if (!current[name]) {
        await queryInterface.addColumn(table, name, definition);
      }
    };

    await addIfMissing('qc_template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'qc_templates', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await addIfMissing('lead', { type: Sequelize.STRING(100), allowNull: true });
    await addIfMissing('start_date', { type: Sequelize.DATEONLY, allowNull: true });
    await addIfMissing('end_date', { type: Sequelize.DATEONLY, allowNull: true });

    // status enum kembali ke 3 nilai juga
    if (current.status) {
      await queryInterface.changeColumn(table, 'status', {
        type: Sequelize.ENUM('On Progress', 'Completed', 'Delayed'),
        allowNull: false,
        defaultValue: 'On Progress',
      });
    }
  },
};

