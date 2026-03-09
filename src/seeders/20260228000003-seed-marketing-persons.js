'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Marketing Persons — tim penjualan
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const persons = [
      { id: uuidv4(), user_id: null, name: 'Budi Santoso',   phone: '081211110001', email: 'budi@maisaprimeris.com',   target: 12, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: null, name: 'Sari Dewi',      phone: '081211110002', email: 'sari@maisaprimeris.com',   target: 10, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: null, name: 'Ahmad Faisal',   phone: '081211110003', email: 'ahmad@maisaprimeris.com',  target: 15, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: null, name: 'Rina Kartika',   phone: '081211110004', email: 'rina@maisaprimeris.com',   target: 10, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), user_id: null, name: 'Doni Prasetyo',  phone: '081211110005', email: 'doni@maisaprimeris.com',   target: 8,  is_active: true, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('marketing_persons', persons, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('marketing_persons', {
      email: {
        [require('sequelize').Op.in]: [
          'budi@maisaprimeris.com',
          'sari@maisaprimeris.com',
          'ahmad@maisaprimeris.com',
          'rina@maisaprimeris.com',
          'doni@maisaprimeris.com',
        ],
      },
    }, {});
  },
};
