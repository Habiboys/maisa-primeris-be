'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      { table: 'ppjb', consumerJoin: 't.consumer_id = c.id', housingJoin: 't.housing_unit_id = h.id' },
      { table: 'akad', consumerJoin: 't.consumer_id = c.id', housingJoin: 't.housing_unit_id = h.id' },
      { table: 'bast', consumerJoin: 't.consumer_id = c.id', housingJoin: 't.housing_unit_id = h.id' },
      { table: 'pindah_unit', consumerJoin: 'p.consumer_id = c.id', housingJoin: null },
      { table: 'pembatalan', consumerJoin: 't.consumer_id = c.id', housingJoin: 't.housing_unit_id = h.id' },
    ];

    for (const { table } of tables) {
      await queryInterface.addColumn(table, 'company_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      await queryInterface.addIndex(table, ['company_id'], { name: `${table}_company_id_idx` });
    }

    // Backfill: ambil dari consumer atau housing_unit agar data lama tidak tercampur.
    await queryInterface.sequelize.query(`
      UPDATE ppjb t
      LEFT JOIN consumers c ON ${tables[0].consumerJoin}
      LEFT JOIN housing_units h ON ${tables[0].housingJoin}
      SET t.company_id = COALESCE(c.company_id, h.company_id)
      WHERE t.company_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE akad t
      LEFT JOIN consumers c ON ${tables[1].consumerJoin}
      LEFT JOIN housing_units h ON ${tables[1].housingJoin}
      SET t.company_id = COALESCE(c.company_id, h.company_id)
      WHERE t.company_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE bast t
      LEFT JOIN consumers c ON ${tables[2].consumerJoin}
      LEFT JOIN housing_units h ON ${tables[2].housingJoin}
      SET t.company_id = COALESCE(c.company_id, h.company_id)
      WHERE t.company_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE pindah_unit p
      LEFT JOIN consumers c ON ${tables[3].consumerJoin}
      LEFT JOIN housing_units hl ON p.housing_unit_id_lama = hl.id
      LEFT JOIN housing_units hb ON p.housing_unit_id_baru = hb.id
      SET p.company_id = COALESCE(c.company_id, hl.company_id, hb.company_id)
      WHERE p.company_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE pembatalan t
      LEFT JOIN consumers c ON ${tables[4].consumerJoin}
      LEFT JOIN housing_units h ON ${tables[4].housingJoin}
      SET t.company_id = COALESCE(c.company_id, h.company_id)
      WHERE t.company_id IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    const tables = ['ppjb', 'akad', 'bast', 'pindah_unit', 'pembatalan'];
    for (const table of tables) {
      await queryInterface.removeIndex(table, `${table}_company_id_idx`);
      await queryInterface.removeColumn(table, 'company_id');
    }
  },
};

