'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Company subscription / subscriber metadata
    await queryInterface.addColumn('companies', 'subscription_plan', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'basic',
    });
    await queryInterface.addColumn('companies', 'billing_cycle', {
      type: Sequelize.ENUM('monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'monthly',
    });
    await queryInterface.addColumn('companies', 'subscription_status', {
      type: Sequelize.ENUM('active', 'trial', 'grace', 'inactive', 'suspended', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    });
    await queryInterface.addColumn('companies', 'subscription_started_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'subscription_ended_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'is_suspended', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    const tables = [
      'projects',
      'transactions',
      'consumers',
      'marketing_persons',
      'unit_statuses',
      'housing_units',
      'work_locations',
      'attendance_settings',
      'qc_templates',
      'construction_statuses',
    ];

    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.addColumn(table, 'company_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.addIndex(table, ['company_id']);
    }

    const [rows] = await queryInterface.sequelize.query(`SELECT id FROM companies ORDER BY created_at ASC LIMIT 1`);
    const defaultCompanyId = rows[0]?.id || null;

    if (defaultCompanyId) {
      await queryInterface.sequelize.query(`UPDATE projects SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });
      await queryInterface.sequelize.query(`UPDATE unit_statuses SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });
      await queryInterface.sequelize.query(`UPDATE work_locations SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });
      await queryInterface.sequelize.query(`UPDATE attendance_settings SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });
      await queryInterface.sequelize.query(`UPDATE qc_templates SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });
      await queryInterface.sequelize.query(`UPDATE construction_statuses SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });

      await queryInterface.sequelize.query(`
        UPDATE transactions t
        JOIN users u ON u.id = t.created_by
        SET t.company_id = u.company_id
        WHERE t.company_id IS NULL
      `);
      await queryInterface.sequelize.query(`UPDATE transactions SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });

      await queryInterface.sequelize.query(`
        UPDATE marketing_persons mp
        JOIN users u ON u.id = mp.user_id
        SET mp.company_id = u.company_id
        WHERE mp.company_id IS NULL
      `);
      await queryInterface.sequelize.query(`UPDATE marketing_persons SET company_id = :cid WHERE company_id IS NULL`, { replacements: { cid: defaultCompanyId } });

      await queryInterface.sequelize.query(`
        UPDATE consumers c
        LEFT JOIN projects p ON p.id = c.project_id
        SET c.company_id = COALESCE(p.company_id, :cid)
        WHERE c.company_id IS NULL
      `, { replacements: { cid: defaultCompanyId } });

      await queryInterface.sequelize.query(`
        UPDATE housing_units h
        LEFT JOIN consumers c ON c.id = h.consumer_id
        LEFT JOIN projects p ON p.id = h.project_id
        SET h.company_id = COALESCE(c.company_id, p.company_id, :cid)
        WHERE h.company_id IS NULL
      `, { replacements: { cid: defaultCompanyId } });
    }
  },

  async down(queryInterface) {
    const tables = [
      'projects',
      'transactions',
      'consumers',
      'marketing_persons',
      'unit_statuses',
      'housing_units',
      'work_locations',
      'attendance_settings',
      'qc_templates',
      'construction_statuses',
    ];

    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeIndex(table, ['company_id']);
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeColumn(table, 'company_id');
    }

    await queryInterface.removeColumn('companies', 'is_suspended');
    await queryInterface.removeColumn('companies', 'subscription_ended_at');
    await queryInterface.removeColumn('companies', 'subscription_started_at');
    await queryInterface.removeColumn('companies', 'subscription_status');
    await queryInterface.removeColumn('companies', 'billing_cycle');
    await queryInterface.removeColumn('companies', 'subscription_plan');
  },
};
