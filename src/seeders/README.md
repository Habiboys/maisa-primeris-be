# Daftar Seeders (urutan jalan)

Jalankan semua: `npm run db:seed`

| Urutan | File | Keterangan |
|--------|------|------------|
| 1 | `20260227100000-seed-saas-bootstrap.js` | Company default, settings, Platform Owner |
| 2 | `20260228000001-seed-users.js` | User per tenant |
| 3 | `20260228000002-seed-work-locations.js` | Lokasi kerja |
| 4 | `20260228000003-seed-marketing-persons.js` | Marketing persons |
| 5 | `20260228000004-seed-housing-units.js` | Unit rumah |
| 6 | `20260228000005-seed-finance-data.js` | Konsumen & transaksi |
| 7 | `20260228000006-seed-leads.js` | Leads |
| 8 | `20260228000007-seed-qc-data.js` | QC |
| 9 | `20260228000008-seed-construction-statuses.js` | Status konstruksi |
| 10 | `20260228000009-seed-projects.js` | Proyek |
| 11 | `20260228000010-seed-unit-statuses.js` | Status unit |
| 12 | `20260228000011-seed-housing-payments.js` | Pembayaran rumah |
| 13 | `20260228000012-seed-legal-data.js` | Data legal |
| 14 | `20260228000013-seed-attendance-data.js` | Absensi |
| 15 | `20260228000014-seed-project-details.js` | Detail proyek |
| **16** | **`20260228000015-seed-sop-data.js`** | **SOP: Permintaan Material, TTG, Barang Keluar, Inventaris, Surat Jalan** |

Jalankan hanya seeder SOP:

```bash
npx sequelize-cli db:seed --seed 20260228000015-seed-sop-data.js
```
