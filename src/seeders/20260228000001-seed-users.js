'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

/**
 * Seeder: Akun awal dengan semua role yang tersedia (tenant Maisa Primeris).
 * Jalankan seed-saas-bootstrap dulu.
 */

const SALT_ROUNDS = 10;

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const password = await bcrypt.hash('Maisa@2026', SALT_ROUNDS);
    const now = new Date();

    const emails = ['superadmin@maisaprimeris.com', 'finance@maisaprimeris.com', 'project@maisaprimeris.com'];
    const [existing] = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN (?)`,
      { replacements: [emails] }
    );
    const existingSet = new Set(existing.map((r) => r.email));

    const users = [
      { name: 'Super Administrator', email: 'superadmin@maisaprimeris.com', role: 'Super Admin', phone: '081100000001' },
      { name: 'Finance Officer', email: 'finance@maisaprimeris.com', role: 'Finance', phone: '081100000002' },
      { name: 'Project Manager', email: 'project@maisaprimeris.com', role: 'Project Management', phone: '081100000003' },
    ]
      .filter((u) => !existingSet.has(u.email))
      .map((u) => ({
        id: uuidv4(),
        name: u.name,
        email: u.email,
        password,
        role: u.role,
        status: 'Aktif',
        phone: u.phone,
        avatar: null,
        company_id: companyId,
        work_location_id: null,
        last_login: null,
        created_at: now,
        updated_at: now,
      }));

    if (users.length > 0) {
      await queryInterface.bulkInsert('users', users, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: {
        [require('sequelize').Op.in]: [
          'superadmin@maisaprimeris.com',
          'finance@maisaprimeris.com',
          'project@maisaprimeris.com',
        ],
      },
    }, {});
  },
};
