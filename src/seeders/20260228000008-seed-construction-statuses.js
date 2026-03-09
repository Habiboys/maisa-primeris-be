'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Deterministic IDs for FK references from project_units seeder
    const CS_PERSIAPAN   = uuidv4();
    const CS_PONDASI     = uuidv4();
    const CS_STRUKTUR    = uuidv4();
    const CS_DINDING     = uuidv4();
    const CS_ATAP        = uuidv4();
    const CS_MEP         = uuidv4();
    const CS_FINISHING   = uuidv4();
    const CS_SERAH_TERIMA = uuidv4();

    await queryInterface.bulkInsert('construction_statuses', [
      { id: CS_PERSIAPAN,    name: 'Persiapan Lahan',    color: '#94a3b8', progress: 5,   order_index: 1, created_at: now, updated_at: now },
      { id: CS_PONDASI,      name: 'Pondasi',            color: '#f97316', progress: 20,  order_index: 2, created_at: now, updated_at: now },
      { id: CS_STRUKTUR,     name: 'Struktur',           color: '#eab308', progress: 40,  order_index: 3, created_at: now, updated_at: now },
      { id: CS_DINDING,      name: 'Dinding & Plester',  color: '#3b82f6', progress: 55,  order_index: 4, created_at: now, updated_at: now },
      { id: CS_ATAP,         name: 'Atap',               color: '#8b5cf6', progress: 65,  order_index: 5, created_at: now, updated_at: now },
      { id: CS_MEP,          name: 'Instalasi MEP',      color: '#06b6d4', progress: 80,  order_index: 6, created_at: now, updated_at: now },
      { id: CS_FINISHING,    name: 'Finishing',           color: '#10b981', progress: 95,  order_index: 7, created_at: now, updated_at: now },
      { id: CS_SERAH_TERIMA, name: 'Serah Terima',       color: '#22c55e', progress: 100, order_index: 8, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    await queryInterface.bulkDelete('construction_statuses', {
      name: {
        [Op.in]: [
          'Persiapan Lahan', 'Pondasi', 'Struktur', 'Dinding & Plester',
          'Atap', 'Instalasi MEP', 'Finishing', 'Serah Terima',
        ],
      },
    });
  },
};
