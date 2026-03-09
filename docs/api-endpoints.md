# API Endpoints — Maisa Primeris App

> **Base URL:** `http://localhost:3000/api/v1`
> **Auth:** Bearer Token (JWT) via `Authorization: Bearer <token>`
> **Format Response:**
>
> ```json
> { "success": true, "data": {...}, "message": "OK" }
> { "success": false, "error": "Pesan error" }
> ```
>
> **Role Access:**
>
> - `SA` = Super Admin
> - `FN` = Finance
> - `PM` = Project Management

---

## Daftar Isi

1. [Auth](#1-auth)
2. [User Management](#2-user-management)
3. [Project & Konstruksi](#3-project--konstruksi)
4. [Quality Control (QC)](#4-quality-control-qc)
5. [Finance & Accounting](#5-finance--accounting)
6. [Marketing & Penjualan](#6-marketing--penjualan)
7. [Housing (Kavling/Unit)](#7-housing-kavlingunit)
8. [Transaksi Legal](#8-transaksi-legal)
9. [Absensi & Pengajuan Izin](#9-absensi--pengajuan-izin)
10. [SOP & Logistik Material](#10-sop--logistik-material)
11. [Dashboard](#11-dashboard)

---

## 1. Auth

| Method | Endpoint                | Deskripsi                                        | Role   |
| ------ | ----------------------- | ------------------------------------------------ | ------ |
| `POST` | `/auth/login`           | Login dengan email & password, returns JWT token | Public |
| `POST` | `/auth/logout`          | Invalidate token / logout                        | All    |
| `GET`  | `/auth/me`              | Ambil profil user yang sedang login              | All    |
| `PUT`  | `/auth/change-password` | Ganti password sendiri                           | All    |

### Detail Body

**POST /auth/login**

```json
{
  "email": "admin@maisaprimeris.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Budi Santoso",
      "email": "admin@maisaprimeris.com",
      "role": "Super Admin"
    }
  }
}
```

---

## 2. User Management

| Method   | Endpoint                      | Deskripsi                                                | Role |
| -------- | ----------------------------- | -------------------------------------------------------- | ---- |
| `GET`    | `/users`                      | Daftar semua user (support filter: role, status, search) | SA   |
| `GET`    | `/users/:id`                  | Detail satu user                                         | SA   |
| `POST`   | `/users`                      | Tambah user baru                                         | SA   |
| `PUT`    | `/users/:id`                  | Update data user                                         | SA   |
| `PATCH`  | `/users/:id/toggle-status`    | Aktifkan / nonaktifkan user                              | SA   |
| `DELETE` | `/users/:id`                  | Hapus user                                               | SA   |
| `GET`    | `/users/activity-logs`        | Daftar log aktivitas (support filter: user, date range)  | SA   |
| `GET`    | `/users/activity-logs/export` | Export log ke CSV                                        | SA   |

### Query Params `/users`

| Param    | Tipe   | Contoh    |
| -------- | ------ | --------- |
| `search` | string | `Ahmad`   |
| `role`   | string | `Finance` |
| `status` | string | `Aktif`   |
| `page`   | int    | `1`       |
| `limit`  | int    | `20`      |

### Body POST/PUT `/users`

```json
{
  "name": "Ahmad Faisal",
  "email": "ahmad@maisaprimeris.com",
  "password": "password123",
  "role": "Project Management"
}
```

---

## 3. Project & Konstruksi

### 3.1 Projects

| Method   | Endpoint        | Deskripsi                                          | Role   |
| -------- | --------------- | -------------------------------------------------- | ------ |
| `GET`    | `/projects`     | Daftar semua proyek (filter: type, status, search) | SA, PM |
| `GET`    | `/projects/:id` | Detail proyek beserta units                        | SA, PM |
| `POST`   | `/projects`     | Buat proyek baru                                   | SA, PM |
| `PUT`    | `/projects/:id` | Update data proyek                                 | SA, PM |
| `DELETE` | `/projects/:id` | Hapus proyek                                       | SA     |

### 3.2 Project Units

| Method   | Endpoint                             | Deskripsi                | Role   |
| -------- | ------------------------------------ | ------------------------ | ------ |
| `GET`    | `/projects/:projectId/units`         | Daftar unit dalam proyek | SA, PM |
| `GET`    | `/projects/:projectId/units/:unitNo` | Detail satu unit         | SA, PM |
| `POST`   | `/projects/:projectId/units`         | Tambah unit ke proyek    | SA, PM |
| `PUT`    | `/projects/:projectId/units/:unitNo` | Update data unit         | SA, PM |
| `DELETE` | `/projects/:projectId/units/:unitNo` | Hapus unit               | SA     |

### 3.3 Construction Status Master

| Method   | Endpoint                     | Deskripsi                | Role   |
| -------- | ---------------------------- | ------------------------ | ------ |
| `GET`    | `/construction-statuses`     | Daftar status konstruksi | SA, PM |
| `POST`   | `/construction-statuses`     | Tambah status baru       | SA     |
| `PUT`    | `/construction-statuses/:id` | Update status            | SA     |
| `DELETE` | `/construction-statuses/:id` | Hapus status             | SA     |

### 3.4 Time Schedule

| Method   | Endpoint                                                   | Deskripsi                               | Role   |
| -------- | ---------------------------------------------------------- | --------------------------------------- | ------ |
| `GET`    | `/projects/:projectId/time-schedule`                       | Ambil time schedule proyek (standalone) | SA, PM |
| `GET`    | `/projects/:projectId/units/:unitNo/time-schedule`         | Ambil time schedule unit                | SA, PM |
| `POST`   | `/projects/:projectId/units/:unitNo/time-schedule`         | Tambah item time schedule               | SA, PM |
| `PUT`    | `/projects/:projectId/units/:unitNo/time-schedule/:itemId` | Update item                             | SA, PM |
| `DELETE` | `/projects/:projectId/units/:unitNo/time-schedule/:itemId` | Hapus item                              | SA, PM |

### 3.5 Inventory Logs (Per Proyek)

| Method | Endpoint                         | Deskripsi                        | Role   |
| ------ | -------------------------------- | -------------------------------- | ------ |
| `GET`  | `/projects/:projectId/inventory` | Daftar log material masuk/keluar | SA, PM |
| `POST` | `/projects/:projectId/inventory` | Tambah log material              | SA, PM |

### 3.6 Work Logs (Log Harian Lapangan)

| Method   | Endpoint                                | Deskripsi                   | Role   |
| -------- | --------------------------------------- | --------------------------- | ------ |
| `GET`    | `/projects/:projectId/work-logs`        | Daftar log pekerjaan harian | SA, PM |
| `POST`   | `/projects/:projectId/work-logs`        | Tambah log harian + foto    | SA, PM |
| `PUT`    | `/projects/:projectId/work-logs/:logId` | Update log                  | SA, PM |
| `DELETE` | `/projects/:projectId/work-logs/:logId` | Hapus log                   | SA     |

### Body POST `/projects`

```json
{
  "name": "Cluster A: Emerald Heights",
  "type": "cluster",
  "location": "Blok A-F",
  "units_count": 45,
  "progress": 0,
  "status": "On Progress",
  "deadline": "Dec 2026",
  "lead": "Ir. Hendra",
  "qc_template_id": "uuid-template"
}
```

---

## 4. Quality Control (QC)

### 4.1 QC Templates

| Method   | Endpoint                      | Deskripsi                          | Role   |
| -------- | ----------------------------- | ---------------------------------- | ------ |
| `GET`    | `/qc-templates`               | Daftar semua template QC           | SA, PM |
| `GET`    | `/qc-templates/:id`           | Detail template + sections + items | SA, PM |
| `POST`   | `/qc-templates`               | Buat template baru                 | SA     |
| `PUT`    | `/qc-templates/:id`           | Update template                    | SA     |
| `DELETE` | `/qc-templates/:id`           | Hapus template                     | SA     |
| `POST`   | `/qc-templates/:id/duplicate` | Duplikasi template                 | SA     |

### 4.2 QC Template Sections & Items

| Method   | Endpoint                                              | Deskripsi                  | Role |
| -------- | ----------------------------------------------------- | -------------------------- | ---- |
| `POST`   | `/qc-templates/:id/sections`                          | Tambah section ke template | SA   |
| `PUT`    | `/qc-templates/:id/sections/:sectionId`               | Update section             | SA   |
| `DELETE` | `/qc-templates/:id/sections/:sectionId`               | Hapus section              | SA   |
| `POST`   | `/qc-templates/:id/sections/:sectionId/items`         | Tambah item ke section     | SA   |
| `PUT`    | `/qc-templates/:id/sections/:sectionId/items/:itemId` | Update item                | SA   |
| `DELETE` | `/qc-templates/:id/sections/:sectionId/items/:itemId` | Hapus item                 | SA   |

### 4.3 QC Submissions

| Method   | Endpoint                     | Deskripsi                                                     | Role   |
| -------- | ---------------------------- | ------------------------------------------------------------- | ------ |
| `GET`    | `/qc-submissions`            | Daftar semua submission (filter: project, unit, status, date) | SA, PM |
| `GET`    | `/qc-submissions/:id`        | Detail submission + results                                   | SA, PM |
| `POST`   | `/qc-submissions`            | Buat submission baru (Draft)                                  | SA, PM |
| `PUT`    | `/qc-submissions/:id`        | Update submission (isi checklist)                             | SA, PM |
| `PATCH`  | `/qc-submissions/:id/submit` | Submit / finalize QC                                          | SA, PM |
| `DELETE` | `/qc-submissions/:id`        | Hapus submission Draft                                        | SA     |
| `GET`    | `/qc-submissions/:id/export` | Export submission ke PDF                                      | SA, PM |

### Body POST `/qc-submissions`

```json
{
  "project_id": "uuid",
  "unit_no": "A-01",
  "template_id": "uuid",
  "inspector_name": "Bpk. Bambang",
  "date": "2026-02-26",
  "results": [
    {
      "template_item_id": "uuid",
      "status": "OK",
      "remarks": "",
      "photo_url": null
    }
  ]
}
```

---

## 5. Finance & Accounting

### 5.1 Transactions (Dana Masuk & Keluar)

| Method   | Endpoint                | Deskripsi                                               | Role   |
| -------- | ----------------------- | ------------------------------------------------------- | ------ |
| `GET`    | `/transactions`         | Daftar transaksi (filter: type, category, date, search) | SA, FN |
| `GET`    | `/transactions/:id`     | Detail transaksi                                        | SA, FN |
| `POST`   | `/transactions`         | Tambah transaksi baru                                   | SA, FN |
| `PUT`    | `/transactions/:id`     | Update transaksi                                        | SA, FN |
| `DELETE` | `/transactions/:id`     | Hapus transaksi                                         | SA     |
| `GET`    | `/transactions/export`  | Export ke Excel/CSV                                     | SA, FN |
| `GET`    | `/transactions/summary` | Ringkasan kas masuk, kas keluar, saldo                  | SA, FN |

### 5.2 Consumers (Piutang)

| Method   | Endpoint         | Deskripsi                              | Role   |
| -------- | ---------------- | -------------------------------------- | ------ |
| `GET`    | `/consumers`     | Daftar konsumen (filter: search, blok) | SA, FN |
| `GET`    | `/consumers/:id` | Detail konsumen + riwayat bayar        | SA, FN |
| `POST`   | `/consumers`     | Tambah konsumen baru                   | SA, FN |
| `PUT`    | `/consumers/:id` | Update data konsumen                   | SA, FN |
| `DELETE` | `/consumers/:id` | Hapus konsumen & riwayatnya            | SA     |

### 5.3 Payment Histories (Per Konsumen)

| Method   | Endpoint                             | Deskripsi                  | Role   |
| -------- | ------------------------------------ | -------------------------- | ------ |
| `GET`    | `/consumers/:id/payments`            | Riwayat transaksi konsumen | SA, FN |
| `POST`   | `/consumers/:id/payments`            | Tambah transaksi baru      | SA, FN |
| `PUT`    | `/consumers/:id/payments/:paymentId` | Update transaksi           | SA, FN |
| `DELETE` | `/consumers/:id/payments/:paymentId` | Hapus transaksi            | SA     |

### Body POST `/transactions`

```json
{
  "date": "2026-02-05",
  "description": "Pembayaran DP Unit A-12",
  "category": "Sales",
  "amount": 45000000,
  "type": "in",
  "unit_blok": "A-12",
  "no_rekening": "BCA 123456789"
}
```

---

## 6. Marketing & Penjualan

### 6.1 Leads

| Method   | Endpoint       | Deskripsi                                                   | Role |
| -------- | -------------- | ----------------------------------------------------------- | ---- |
| `GET`    | `/leads`       | Daftar leads (filter: status, search, source, marketing_id) | SA   |
| `GET`    | `/leads/:id`   | Detail lead                                                 | SA   |
| `POST`   | `/leads`       | Tambah lead baru                                            | SA   |
| `PUT`    | `/leads/:id`   | Update data lead                                            | SA   |
| `DELETE` | `/leads/:id`   | Hapus lead                                                  | SA   |
| `GET`    | `/leads/stats` | Statistik: total, hot, closing rate, estimasi revenue       | SA   |

### 6.2 Marketing Persons (Tim Marketing)

| Method   | Endpoint                 | Deskripsi                                   | Role |
| -------- | ------------------------ | ------------------------------------------- | ---- |
| `GET`    | `/marketing-persons`     | Daftar tim marketing (filter: type, status) | SA   |
| `GET`    | `/marketing-persons/:id` | Detail marketing person                     | SA   |
| `POST`   | `/marketing-persons`     | Tambah marketing person                     | SA   |
| `PUT`    | `/marketing-persons/:id` | Update data                                 | SA   |
| `DELETE` | `/marketing-persons/:id` | Hapus                                       | SA   |

### 6.3 Unit Statuses (Siteplan)

| Method | Endpoint                 | Deskripsi                               | Role |
| ------ | ------------------------ | --------------------------------------- | ---- |
| `GET`  | `/unit-statuses`         | Daftar status unit (siteplan marketing) | SA   |
| `PUT`  | `/unit-statuses/:unitNo` | Update status unit                      | SA   |

### Body POST `/leads`

```json
{
  "name": "Slamet Riyadi",
  "phone": "081234567890",
  "email": "slamet@email.com",
  "status": "Hot",
  "interest": "A-12",
  "source": "Facebook Ads",
  "marketing_id": "uuid-MKT-001"
}
```

---

## 7. Housing (Kavling/Unit)

| Method   | Endpoint                           | Deskripsi                                          | Role   |
| -------- | ---------------------------------- | -------------------------------------------------- | ------ |
| `GET`    | `/housing`                         | Daftar unit kavling (filter: status, tipe, search) | SA     |
| `GET`    | `/housing/:id`                     | Detail unit + riwayat bayar                        | SA     |
| `POST`   | `/housing`                         | Tambah unit baru                                   | SA     |
| `PUT`    | `/housing/:id`                     | Update data unit                                   | SA     |
| `DELETE` | `/housing/:id`                     | Hapus unit                                         | SA     |
| `GET`    | `/housing/:id/payments`            | Riwayat pembayaran unit                            | SA, FN |
| `POST`   | `/housing/:id/payments`            | Tambah riwayat pembayaran                          | SA, FN |
| `PUT`    | `/housing/:id/payments/:paymentId` | Update riwayat                                     | SA, FN |
| `DELETE` | `/housing/:id/payments/:paymentId` | Hapus riwayat                                      | SA     |

### Body POST `/housing`

```json
{
  "no": "A-01",
  "tipe": "Emerald (36/60)",
  "luas_tanah": 60,
  "luas_bangunan": 36,
  "harga": 450000000,
  "status": "Available",
  "panjang_kanan": 10.5,
  "panjang_kiri": 10.5,
  "lebar_depan": 13.0,
  "lebar_belakang": 13.0,
  "harga_per_meter": 7500000,
  "daya_listrik": 2200,
  "id_rumah": "001",
  "nomor_sertipikat": "SHM-001/2026",
  "keterangan": "Unit siap huni"
}
```

---

## 8. Transaksi Legal

### 8.1 PPJB (Perjanjian Pengikatan Jual Beli)

| Method   | Endpoint                 | Deskripsi                            | Role   |
| -------- | ------------------------ | ------------------------------------ | ------ |
| `GET`    | `/ppjb`                  | Daftar PPJB (search, filter tanggal) | SA, FN |
| `GET`    | `/ppjb/:id`              | Detail PPJB                          | SA, FN |
| `POST`   | `/ppjb`                  | Buat PPJB baru                       | SA, FN |
| `PUT`    | `/ppjb/:id`              | Update PPJB                          | SA, FN |
| `DELETE` | `/ppjb/:id`              | Hapus PPJB                           | SA     |
| `POST`   | `/ppjb/:id/upload-ppjb`  | Upload file PPJB (PDF)               | SA, FN |
| `POST`   | `/ppjb/:id/upload-tatib` | Upload file Tata Tertib (PDF)        | SA, FN |

### 8.2 Akad

| Method   | Endpoint    | Deskripsi      | Role   |
| -------- | ----------- | -------------- | ------ |
| `GET`    | `/akad`     | Daftar akad    | SA, FN |
| `GET`    | `/akad/:id` | Detail akad    | SA, FN |
| `POST`   | `/akad`     | Buat akad baru | SA, FN |
| `PUT`    | `/akad/:id` | Update akad    | SA, FN |
| `DELETE` | `/akad/:id` | Hapus akad     | SA     |

### 8.3 BAST (Berita Acara Serah Terima)

| Method   | Endpoint           | Deskripsi              | Role   |
| -------- | ------------------ | ---------------------- | ------ |
| `GET`    | `/bast`            | Daftar BAST            | SA, FN |
| `GET`    | `/bast/:id`        | Detail BAST            | SA, FN |
| `POST`   | `/bast`            | Buat BAST baru         | SA, FN |
| `PUT`    | `/bast/:id`        | Update BAST            | SA, FN |
| `DELETE` | `/bast/:id`        | Hapus BAST             | SA     |
| `POST`   | `/bast/:id/upload` | Upload file BAST (PDF) | SA, FN |

### 8.4 Pindah Unit

| Method   | Endpoint           | Deskripsi                    | Role   |
| -------- | ------------------ | ---------------------------- | ------ |
| `GET`    | `/pindah-unit`     | Daftar pengajuan pindah unit | SA, FN |
| `GET`    | `/pindah-unit/:id` | Detail pengajuan             | SA, FN |
| `POST`   | `/pindah-unit`     | Buat pengajuan baru          | SA, FN |
| `PUT`    | `/pindah-unit/:id` | Update pengajuan             | SA, FN |
| `DELETE` | `/pindah-unit/:id` | Hapus pengajuan              | SA     |

### 8.5 Pembatalan

| Method   | Endpoint          | Deskripsi            | Role   |
| -------- | ----------------- | -------------------- | ------ |
| `GET`    | `/pembatalan`     | Daftar pembatalan    | SA, FN |
| `GET`    | `/pembatalan/:id` | Detail pembatalan    | SA, FN |
| `POST`   | `/pembatalan`     | Buat pembatalan baru | SA, FN |
| `PUT`    | `/pembatalan/:id` | Update pembatalan    | SA, FN |
| `DELETE` | `/pembatalan/:id` | Hapus pembatalan     | SA     |

---

## 9. Absensi & Pengajuan Izin

### 9.1 Work Locations

| Method   | Endpoint              | Deskripsi             | Role |
| -------- | --------------------- | --------------------- | ---- |
| `GET`    | `/work-locations`     | Daftar lokasi absensi | SA   |
| `GET`    | `/work-locations/:id` | Detail lokasi         | SA   |
| `POST`   | `/work-locations`     | Tambah lokasi baru    | SA   |
| `PUT`    | `/work-locations/:id` | Update lokasi         | SA   |
| `DELETE` | `/work-locations/:id` | Hapus lokasi          | SA   |

### 9.2 User-Location Assignment

| Method   | Endpoint                         | Deskripsi                     | Role |
| -------- | -------------------------------- | ----------------------------- | ---- |
| `GET`    | `/user-location-assignments`     | Daftar mapping user ke lokasi | SA   |
| `POST`   | `/user-location-assignments`     | Assign user ke lokasi         | SA   |
| `PUT`    | `/user-location-assignments/:id` | Update assignment             | SA   |
| `DELETE` | `/user-location-assignments/:id` | Hapus assignment              | SA   |

### 9.3 Attendances

| Method | Endpoint                 | Deskripsi                                    | Role |
| ------ | ------------------------ | -------------------------------------------- | ---- |
| `GET`  | `/attendances`           | Rekap kehadiran (filter: user, date, status) | SA   |
| `GET`  | `/attendances/my`        | Riwayat absensi user yang login              | All  |
| `POST` | `/attendances/clock-in`  | Absen masuk (kirim koordinat GPS)            | All  |
| `POST` | `/attendances/clock-out` | Absen pulang (kirim koordinat GPS)           | All  |
| `GET`  | `/attendances/export`    | Export rekap ke Excel                        | SA   |

### 9.4 Leave Requests (Pengajuan Izin/Cuti)

| Method   | Endpoint                      | Deskripsi                              | Role |
| -------- | ----------------------------- | -------------------------------------- | ---- |
| `GET`    | `/leave-requests`             | Daftar semua pengajuan                 | SA   |
| `GET`    | `/leave-requests/my`          | Pengajuan izin user yang login         | All  |
| `POST`   | `/leave-requests`             | Ajukan izin/cuti                       | All  |
| `PATCH`  | `/leave-requests/:id/approve` | Setujui pengajuan                      | SA   |
| `PATCH`  | `/leave-requests/:id/reject`  | Tolak pengajuan                        | SA   |
| `DELETE` | `/leave-requests/:id`         | Hapus pengajuan (hanya status Pending) | All  |

### Body POST `/attendances/clock-in`

```json
{
  "lat": -6.2088,
  "lng": 106.8456
}
```

### Body POST `/leave-requests`

```json
{
  "type": "Cuti",
  "duration": 2,
  "start_date": "2026-03-01",
  "end_date": "2026-03-02",
  "note": "Keperluan keluarga"
}
```

---

## 10. SOP & Logistik Material

### 10.1 Permintaan Material

| Method   | Endpoint                         | Deskripsi                                           | Role   |
| -------- | -------------------------------- | --------------------------------------------------- | ------ |
| `GET`    | `/material-requests`             | Daftar permintaan (filter: status, tanggal, divisi) | SA, PM |
| `GET`    | `/material-requests/:id`         | Detail permintaan + items                           | SA, PM |
| `POST`   | `/material-requests`             | Buat permintaan baru                                | SA, PM |
| `PUT`    | `/material-requests/:id`         | Update permintaan                                   | SA, PM |
| `PATCH`  | `/material-requests/:id/approve` | Setujui permintaan                                  | SA     |
| `PATCH`  | `/material-requests/:id/reject`  | Tolak permintaan                                    | SA     |
| `DELETE` | `/material-requests/:id`         | Hapus permintaan                                    | SA     |

### 10.2 Tanda Terima Gudang

| Method   | Endpoint                         | Deskripsi                                      | Role   |
| -------- | -------------------------------- | ---------------------------------------------- | ------ |
| `GET`    | `/warehouse-receipts`            | Daftar tanda terima (filter: status, supplier) | SA, PM |
| `GET`    | `/warehouse-receipts/:id`        | Detail + items                                 | SA, PM |
| `POST`   | `/warehouse-receipts`            | Buat tanda terima baru                         | SA, PM |
| `PUT`    | `/warehouse-receipts/:id`        | Update                                         | SA, PM |
| `PATCH`  | `/warehouse-receipts/:id/verify` | Verifikasi tanda terima                        | SA     |
| `DELETE` | `/warehouse-receipts/:id`        | Hapus                                          | SA     |

### 10.3 Barang Keluar

| Method   | Endpoint                | Deskripsi                                               | Role   |
| -------- | ----------------------- | ------------------------------------------------------- | ------ |
| `GET`    | `/goods-out`            | Daftar barang keluar (filter: status, project, tanggal) | SA, PM |
| `GET`    | `/goods-out/:id`        | Detail + items                                          | SA, PM |
| `POST`   | `/goods-out`            | Buat form barang keluar                                 | SA, PM |
| `PUT`    | `/goods-out/:id`        | Update                                                  | SA, PM |
| `PATCH`  | `/goods-out/:id/status` | Update status (Dikirim/Diterima)                        | SA, PM |
| `DELETE` | `/goods-out/:id`        | Hapus                                                   | SA     |

### 10.4 Inventaris Lapangan

| Method   | Endpoint         | Deskripsi                                                     | Role   |
| -------- | ---------------- | ------------------------------------------------------------- | ------ |
| `GET`    | `/inventory`     | Daftar inventaris (filter: kategori, lokasi, kondisi, search) | SA, PM |
| `GET`    | `/inventory/:id` | Detail item inventaris                                        | SA, PM |
| `POST`   | `/inventory`     | Tambah item                                                   | SA, PM |
| `PUT`    | `/inventory/:id` | Update item                                                   | SA, PM |
| `DELETE` | `/inventory/:id` | Hapus item                                                    | SA     |

### 10.5 Surat Jalan

| Method   | Endpoint                      | Deskripsi                                    | Role   |
| -------- | ----------------------------- | -------------------------------------------- | ------ |
| `GET`    | `/delivery-orders`            | Daftar surat jalan (filter: status, tanggal) | SA, PM |
| `GET`    | `/delivery-orders/:id`        | Detail + items                               | SA, PM |
| `POST`   | `/delivery-orders`            | Buat surat jalan                             | SA, PM |
| `PUT`    | `/delivery-orders/:id`        | Update                                       | SA, PM |
| `PATCH`  | `/delivery-orders/:id/status` | Update status pengiriman                     | SA, PM |
| `DELETE` | `/delivery-orders/:id`        | Hapus                                        | SA     |

---

## 11. Dashboard

| Method | Endpoint                           | Deskripsi                                               | Role       |
| ------ | ---------------------------------- | ------------------------------------------------------- | ---------- |
| `GET`  | `/dashboard/summary`               | KPI: total unit, unit terjual, unit progres, pendapatan | SA, FN, PM |
| `GET`  | `/dashboard/cashflow`              | Data arus kas per bulan (param: `months=6`)             | SA, FN     |
| `GET`  | `/dashboard/construction-progress` | Progres pembangunan per fase                            | SA, PM     |
| `GET`  | `/dashboard/sales-distribution`    | Distribusi status penjualan (Available/Booking/Sold)    | SA         |
| `GET`  | `/dashboard/budget-vs-actual`      | Perbandingan anggaran vs realisasi bulanan              | SA, FN     |

### Response `/dashboard/summary`

```json
{
  "success": true,
  "data": {
    "total_unit": 120,
    "unit_terjual": 84,
    "unit_progres": 36,
    "pendapatan": 12400000000,
    "target_penjualan_pct": 70,
    "unit_kritis": 12
  }
}
```

---

## Catatan Implementasi

### File Upload

Endpoint upload file (foto, PDF) akan menggunakan `multipart/form-data`. Disarankan menggunakan:

- **Local storage** (sementara) → `uploads/` folder
- **Cloud storage** (produksi) → AWS S3 / Cloudflare R2

### Pagination

Semua endpoint daftar (`GET /resource`) mendukung:

```
?page=1&limit=20
```

Response akan menyertakan:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error Codes

| HTTP Code | Keterangan                             |
| --------- | -------------------------------------- |
| `200`     | OK                                     |
| `201`     | Created                                |
| `400`     | Bad Request (validasi gagal)           |
| `401`     | Unauthorized (token tidak ada/expired) |
| `403`     | Forbidden (role tidak memiliki akses)  |
| `404`     | Data tidak ditemukan                   |
| `500`     | Internal Server Error                  |

### Tech Stack Rekomendasi (Backend)

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize (sesuai dengan setup `backend/models/index.js` yang sudah ada)
- **Database:** PostgreSQL
- **Auth:** JWT (`jsonwebtoken`)
- **Validasi:** Joi / express-validator
- **Upload:** Multer
