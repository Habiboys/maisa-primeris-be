'use strict';

/**
 * Seeder SaaS Bootstrap — HARUS jalan paling awal.
 * Membuat: 1 company (Maisa Primeris), company_settings, attendance_setting,
 * dan user Platform Owner. Work locations dll dari seeder lain.
 * Semua seeder lain mengisi company_id ke company ini.
 *
 * Cara pakai:
 *   npm run db:seed        → jalankan semua seeder (bootstrap jalan dulu)
 *   npm run db:seed:undo  → undo semua seeder (bootstrap di-undo terakhir)
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const COMPANY_CODE = 'maisa-primeris';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    let [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE code = ? LIMIT 1`,
      { replacements: [COMPANY_CODE] }
    );

    let companyId = existing[0]?.id;
    if (!companyId) {
      companyId = uuidv4();
      await queryInterface.bulkInsert('companies', [{
        id: companyId,
        name: 'Maisa Primeris',
        code: COMPANY_CODE,
        domain: null,
        is_active: true,
        subscription_plan: 'enterprise',
        billing_cycle: 'yearly',
        subscription_status: 'active',
        subscription_started_at: now,
        subscription_ended_at: null,
        is_suspended: false,
        created_at: now,
        updated_at: now,
      }]);
    }

    [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM company_settings WHERE company_id = ? LIMIT 1`,
      { replacements: [companyId] }
    );
    if (!existing[0]) {
      await queryInterface.bulkInsert('company_settings', [{
        id: uuidv4(),
        company_id: companyId,
        app_name: 'Primeris One',
        logo_url: null,
        primary_color: '#2563eb',
        secondary_color: '#14b8a6',
        accent_color: '#f59e0b',
        created_at: now,
        updated_at: now,
      }]);
    }

    [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM attendance_settings WHERE company_id = ? LIMIT 1`,
      { replacements: [companyId] }
    );
    if (!existing[0]) {
      await queryInterface.bulkInsert('attendance_settings', [{
        id: uuidv4(),
        company_id: companyId,
        work_start_time: '08:00:00',
        work_end_time: '17:00:00',
        late_grace_minutes: 0,
        created_at: now,
        updated_at: now,
      }]);
    }

    // Work locations dibuat oleh seed-work-locations (per tenant)

    await queryInterface.sequelize.query(
      `UPDATE users SET company_id = ? WHERE company_id IS NULL AND role != 'Platform Owner'`,
      { replacements: [companyId] }
    );

    [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'Platform Owner' LIMIT 1`
    );
    if (!existing[0]) {
      const password = await bcrypt.hash('Maisa@2026', 10);
      await queryInterface.bulkInsert('users', [{
        id: uuidv4(),
        name: 'Platform Owner',
        email: 'owner@platform.maisa',
        password,
        role: 'Platform Owner',
        status: 'Aktif',
        phone: '081100000000',
        avatar: null,
        company_id: null,
        work_location_id: null,
        last_login: null,
        created_at: now,
        updated_at: now,
      }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'owner@platform.maisa' }, {});

    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE code = ? LIMIT 1`,
      { replacements: [COMPANY_CODE] }
    );
    const companyId = rows[0]?.id;
    if (companyId) {
      await queryInterface.bulkDelete('attendance_settings', { company_id: companyId }, {});
      await queryInterface.bulkDelete('company_settings', { company_id: companyId }, {});
      await queryInterface.bulkDelete('companies', { id: companyId }, {});
    }

    await queryInterface.sequelize.query(`UPDATE users SET company_id = NULL WHERE company_id IS NOT NULL`);
  },
};
