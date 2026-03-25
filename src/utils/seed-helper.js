'use strict';

/**
 * Helper untuk seeders berbasis SaaS.
 * Mengambil company_id default (Maisa Primeris). Jalankan seed-saas-bootstrap dulu.
 */
async function getDefaultCompanyId(queryInterface) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM companies WHERE code = 'maisa-primeris' LIMIT 1`
  );
  const id = rows[0]?.id;
  if (!id) {
    throw new Error('Seeder membutuhkan company default. Jalankan: npx sequelize-cli db:seed --seed 20260227100000-seed-saas-bootstrap.js');
  }
  return id;
}

module.exports = { getDefaultCompanyId };
