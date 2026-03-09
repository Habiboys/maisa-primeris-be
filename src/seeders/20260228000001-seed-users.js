'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Akun awal dengan semua role yang tersedia.
 *
 * Role yang tersedia:
 *  - Super Admin  → akses semua modul
 *  - Finance      → Dashboard, Finance, Absensi, Transaksi
 *  - Project Management → Dashboard, Konstruksi, SOP, Absensi
 *
 * Cara jalankan:
 *   npx sequelize-cli db:seed:all
 *   atau hanya file ini:
 *   npx sequelize-cli db:seed --seed 20260228000001-seed-users.js
 *
 * Cara undo:
 *   npx sequelize-cli db:seed:undo --seed 20260228000001-seed-users.js
 */

const SALT_ROUNDS = 10;

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('Maisa@2026', SALT_ROUNDS);
    const now = new Date();

    const users = [
      {
        id        : uuidv4(),
        name      : 'Super Administrator',
        email     : 'superadmin@maisaprimeris.com',
        password,
        role      : 'Super Admin',
        status    : 'Aktif',
        phone     : '081100000001',
        avatar    : null,
        work_location_id: null,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
      {
        id        : uuidv4(),
        name      : 'Finance Officer',
        email     : 'finance@maisaprimeris.com',
        password,
        role      : 'Finance',
        status    : 'Aktif',
        phone     : '081100000002',
        avatar    : null,
        work_location_id: null,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
      {
        id        : uuidv4(),
        name      : 'Project Manager',
        email     : 'project@maisaprimeris.com',
        password,
        role      : 'Project Management',
        status    : 'Aktif',
        phone     : '081100000003',
        avatar    : null,
        work_location_id: null,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('users', users, {});
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
