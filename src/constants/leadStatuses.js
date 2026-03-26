'use strict';

/**
 * Status prospek (leads) — harus identik dengan kolom ENUM di `leads.status`
 * dan dengan `frontend/src/constants/leadStatus.ts`.
 * Ubah di sini + migration ENUM jika menambah/mengurangi nilai.
 */
const LEAD_STATUS_VALUES = Object.freeze([
  'Baru',
  'Follow-up',
  'Survey',
  'Negoisasi',
  'Deal',
  'Batal',
]);

module.exports = { LEAD_STATUS_VALUES };
