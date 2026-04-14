'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

const SALT_ROUNDS = 10;

module.exports = {
  async up(queryInterface) {
    const email = 'sekretaris@maisaprimeris.com';
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      { replacements: [email] },
    );
    if (Array.isArray(existing) && existing.length > 0) return;

    const companyId = await getDefaultCompanyId(queryInterface);
    const password = await bcrypt.hash('Maisa@2026', SALT_ROUNDS);
    const now = new Date();

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      name: 'Sekretaris Proyek',
      email,
      password,
      role: 'Sekretaris',
      status: 'Aktif',
      phone: '081100000004',
      avatar: null,
      company_id: companyId,
      work_location_id: null,
      last_login: null,
      created_at: now,
      updated_at: now,
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'sekretaris@maisaprimeris.com',
    }, {});
  },
};
