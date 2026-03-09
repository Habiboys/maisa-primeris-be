'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Leads — data pipeline marketing
 * marketing_id diambil berdasarkan nama di tabel marketing_persons
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil id marketing persons yang sudah di-seed sebelumnya
    const persons = await queryInterface.sequelize.query(
      `SELECT id, name FROM marketing_persons ORDER BY created_at ASC LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Map nama → id (fallback null jika kosong)
    const pid = (idx) => (persons[idx] ? persons[idx].id : null);

    const now = new Date();

    const leads = [
      { id: uuidv4(), name: 'Agus Salim',       phone: '082100000001', email: 'agus@email.com',    source: 'Website',   marketing_id: pid(0), project_id: null, interest: 'Tipe Emerald 36/60', status: 'Deal',      notes: 'Sudah deal unit A-03', follow_up_date: null,         created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Dewi Lestari',      phone: '082100000002', email: 'dewi@email.com',    source: 'Referral',  marketing_id: pid(1), project_id: null, interest: 'Tipe Sapphire 45/72', status: 'Negoisasi', notes: 'Masih nego harga',     follow_up_date: '2026-03-15', created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Fajar Nugroho',     phone: '082100000003', email: 'fajar@email.com',   source: 'Instagram', marketing_id: pid(2), project_id: null, interest: 'Tipe Emerald 36/60', status: 'Survey',    notes: 'Sudah survei lokasi',  follow_up_date: '2026-03-10', created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Hana Wijayanti',    phone: '082100000004', email: 'hana@email.com',    source: 'Pameran',   marketing_id: pid(0), project_id: null, interest: 'Tipe Diamond 54/90',  status: 'Follow-up', notes: 'Tertarik tipe besar',  follow_up_date: '2026-03-08', created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Irfan Maulana',     phone: '082100000005', email: 'irfan@email.com',   source: 'Facebook',  marketing_id: pid(3), project_id: null, interest: 'Tipe Sapphire 45/72', status: 'Baru',      notes: 'Baru masuk inquiry',   follow_up_date: '2026-03-20', created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Joko Susanto',      phone: '082100000006', email: 'joko@email.com',    source: 'Website',   marketing_id: pid(1), project_id: null, interest: 'Tipe Emerald 36/60', status: 'Batal',     notes: 'Pindah ke developer lain', follow_up_date: null,      created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Kartika Sari',      phone: '082100000007', email: 'kartika@email.com', source: 'Referral',  marketing_id: pid(4), project_id: null, interest: 'Tipe Sapphire 45/72', status: 'Deal',      notes: 'Deal unit B-01',       follow_up_date: null,         created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Lutfi Hakim',       phone: '082100000008', email: 'lutfi@email.com',   source: 'Instagram', marketing_id: pid(2), project_id: null, interest: 'Tipe Diamond 54/90',  status: 'Follow-up', notes: 'Berminat, menunggu gajian', follow_up_date: '2026-03-25', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('leads', leads, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('leads', {
      phone: {
        [require('sequelize').Op.like]: '0821000000%',
      },
    }, {});
  },
};
