'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDefaultCompanyId } = require('../utils/seed-helper');

module.exports = {
  async up(queryInterface) {
    const companyId = await getDefaultCompanyId(queryInterface);
    const now = new Date();

    const CS_PERSIAPAN   = uuidv4();
    const CS_PONDASI     = uuidv4();
    const CS_STRUKTUR    = uuidv4();
    const CS_DINDING     = uuidv4();
    const CS_ATAP        = uuidv4();
    const CS_MEP         = uuidv4();
    const CS_FINISHING   = uuidv4();
    const CS_SERAH_TERIMA = uuidv4();

    await queryInterface.bulkInsert('construction_statuses', [
      { id: CS_PERSIAPAN,    company_id: companyId, name: 'Persiapan Lahan',    color: '#94a3b8', progress: 5,   order_index: 1, created_at: now, updated_at: now },
      { id: CS_PONDASI,      company_id: companyId, name: 'Pondasi',            color: '#f97316', progress: 20,  order_index: 2, created_at: now, updated_at: now },
      { id: CS_STRUKTUR,     company_id: companyId, name: 'Struktur',           color: '#eab308', progress: 40,  order_index: 3, created_at: now, updated_at: now },
      { id: CS_DINDING,      company_id: companyId, name: 'Dinding & Plester',  color: '#3b82f6', progress: 55,  order_index: 4, created_at: now, updated_at: now },
      { id: CS_ATAP,         company_id: companyId, name: 'Atap',               color: '#8b5cf6', progress: 65,  order_index: 5, created_at: now, updated_at: now },
      { id: CS_MEP,          company_id: companyId, name: 'Instalasi MEP',      color: '#06b6d4', progress: 80,  order_index: 6, created_at: now, updated_at: now },
      { id: CS_FINISHING,    company_id: companyId, name: 'Finishing',          color: '#10b981', progress: 95,  order_index: 7, created_at: now, updated_at: now },
      { id: CS_SERAH_TERIMA, company_id: companyId, name: 'Serah Terima',       color: '#22c55e', progress: 100, order_index: 8, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE code = 'maisa-primeris' LIMIT 1`
    );
    const companyId = rows[0]?.id;
    const where = {
      name: {
        [Op.in]: [
          'Persiapan Lahan', 'Pondasi', 'Struktur', 'Dinding & Plester',
          'Atap', 'Instalasi MEP', 'Finishing', 'Serah Terima',
        ],
      },
    };
    if (companyId) where.company_id = companyId;
    await queryInterface.bulkDelete('construction_statuses', where);
  },
};
