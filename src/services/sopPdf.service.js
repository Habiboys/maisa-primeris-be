'use strict';

const PDFDocument = require('pdfkit');

// ── Shared: minimal style (small font, clean) ─────────────────────
const FONT_SIZE = 8;
const FONT_TITLE = 10;
const MARGIN = 40;
const LINE = 12;

function addHeader(doc, companyName = 'MAISA PRIMERIS', address = 'JL. Batang Marao No.9, Padang') {
  doc.fontSize(FONT_TITLE).font('Helvetica-Bold').text(companyName, MARGIN, MARGIN);
  doc.fontSize(FONT_SIZE).font('Helvetica').text(address, MARGIN, doc.y + 2);
  doc.moveDown(0.5);
}

function addTitle(doc, title, subtitle = '') {
  doc.fontSize(FONT_TITLE).font('Helvetica-Bold').text(title, MARGIN, doc.y + 4, { align: 'center' });
  if (subtitle) doc.fontSize(FONT_SIZE).font('Helvetica').text(subtitle, MARGIN, doc.y + 2, { align: 'center' });
  doc.moveDown(0.8);
}

function drawTable(doc, opts) {
  const { cols, rows, startY } = opts;
  const pageWidth = doc.page.width - 2 * MARGIN;
  const colWidths = cols.map(c => c.width ?? (pageWidth / cols.length));
  let y = startY ?? doc.y + 4;
  const rowHeight = 14;

  // Header row
  doc.fontSize(FONT_SIZE).font('Helvetica-Bold');
  let x = MARGIN;
  cols.forEach((col, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(col.label, x + 4, y + 3, { width: colWidths[i] - 6, align: col.align || 'left' });
    x += colWidths[i];
  });
  y += rowHeight;

  doc.font('Helvetica');
  rows.forEach((row) => {
    x = MARGIN;
    row.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(String(cell ?? ''), x + 4, y + 3, { width: colWidths[i] - 6, align: cols[i].align || 'left' });
      x += colWidths[i];
    });
    y += rowHeight;
  });
  doc.y = y + 6;
}

// ── Permintaan Material ─────────────────────────────────────────
function normalizePermintaan(data) {
  const items = (data.items || []).map(i => ({
    namaBarang: i.namaBarang ?? i.item_name ?? '',
    qty: Number(i.qty ?? i.qty_requested ?? 0),
    satuan: i.satuan ?? i.unit ?? '',
    keterangan: i.keterangan ?? i.notes ?? '',
  }));
  return {
    noForm: data.noForm ?? data.nomor ?? '',
    tanggal: data.tanggal ?? new Date().toISOString().slice(0, 10),
    divisi: data.divisi ?? '',
    namaPeminta: data.namaPeminta ?? '',
    disetujui: data.disetujui ?? '',
    diperiksa: data.diperiksa ?? '',
    items,
  };
}

function buildPermintaanPdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const buf = [];
    doc.on('data', buf.push.bind(buf));
    doc.on('end', () => resolve(Buffer.concat(buf)));
    doc.on('error', reject);

    const d = normalizePermintaan(payload);
    addHeader(doc);
    addTitle(doc, 'PERMINTAAN MATERIAL', `Nomor: ${d.noForm}`);

    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text(`Tanggal : ${d.tanggal}`, MARGIN, doc.y);
    doc.text(`Divisi  : ${d.divisi || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Peminta : ${d.namaPeminta || '-'}`, MARGIN, doc.y + LINE);
    doc.moveDown(0.8);

    const pageWidth = doc.page.width - 2 * MARGIN;
    drawTable(doc, {
      cols: [
        { label: 'No', width: 24, align: 'center' },
        { label: 'Nama Material', width: pageWidth * 0.40 },
        { label: 'Qty', width: 36, align: 'center' },
        { label: 'Satuan', width: 40, align: 'center' },
        { label: 'Keterangan', width: pageWidth * 0.32 },
      ],
      rows: (d.items.length ? d.items : [{}]).map((row, idx) => ([
        idx + 1,
        row.namaBarang ?? '',
        row.qty ?? '',
        row.satuan ?? '',
        row.keterangan ?? '',
      ])),
    });

    const sigY = doc.y + 18;
    doc.text('Disetujui', MARGIN, sigY);
    doc.text(d.disetujui || '........................', MARGIN, sigY + 24);
    doc.text('Diperiksa', pageWidth / 2 - 40, sigY);
    doc.text(d.diperiksa || '........................', pageWidth / 2 - 40, sigY + 24);
    doc.text('Peminta', pageWidth - 80, sigY);
    doc.text(d.namaPeminta || '........................', pageWidth - 80, sigY + 24);
    doc.end();
  });
}

function buildPermintaanHtml(payload) {
  const d = normalizePermintaan(payload);
  const rows = (d.items.length ? d.items : [{}]).map((row, idx) =>
    `<tr>
      <td class="tc">${idx + 1}</td>
      <td>${escapeHtml(row.namaBarang ?? '')}</td>
      <td class="tc">${row.qty ?? ''}</td>
      <td class="tc">${escapeHtml(row.satuan ?? '')}</td>
      <td>${escapeHtml(row.keterangan ?? '')}</td>
    </tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#111;margin:24px;}
h1{font-size:11px;text-align:center;margin:8px 0 4px;}
.meta{margin:8px 0;}
table{width:100%;border-collapse:collapse;margin:12px 0;}
th,td{border:1px solid #333;padding:4px 6px;}
th{font-weight:700;background:#f5f5f5;}
.tc{text-align:center;}
.sig{display:inline-block;width:30%;margin-top:20px;}
.sig span{display:block;border-bottom:1px solid #333;font-size:8px;margin-bottom:4px;}
</style></head><body>
<p style="font-weight:700;font-size:10px;">MAISA PRIMERIS</p>
<h1>PERMINTAAN MATERIAL</h1>
<p class="meta" style="text-align:center;">Nomor: ${escapeHtml(d.noForm)}</p>
<div class="meta">
  Tanggal: ${d.tanggal} &nbsp; Divisi: ${escapeHtml(d.divisi)} &nbsp; Peminta: ${escapeHtml(d.namaPeminta)}
</div>
<table>
<thead>
  <tr>
    <th class="tc" style="width:26px;">No</th>
    <th>Nama Material</th>
    <th class="tc" style="width:50px;">Qty</th>
    <th class="tc" style="width:60px;">Satuan</th>
    <th>Keterangan</th>
  </tr>
</thead>
<tbody>${rows}</tbody>
</table>
<div class="sig"><span>Disetujui</span>${escapeHtml(d.disetujui) || '........................'}</div>
<div class="sig"><span>Diperiksa</span>${escapeHtml(d.diperiksa) || '........................'}</div>
<div class="sig"><span>Peminta</span>${escapeHtml(d.namaPeminta) || '........................'}</div>
</body></html>`;
}

// ── TTG: Tanda Terima Gudang ────────────────────────────────────
function normalizeTTG(data) {
  const items = (data.items || []).map(i => ({
    namaBarang: i.namaBarang ?? i.item_name ?? '',
    qty: Number(i.qty ?? i.qty_received ?? 0),
    satuan: i.satuan ?? i.unit ?? '',
  }));
  return {
    noTerima: data.noTerima ?? data.nomor ?? '',
    supplier: data.supplier ?? '',
    penerima: data.penerima ?? '',
    items,
    mengetahui: data.mengetahui ?? '',
    pengirim: data.pengirim ?? '',
  };
}

function buildTTGPdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const buf = [];
    doc.on('data', buf.push.bind(buf));
    doc.on('end', () => resolve(Buffer.concat(buf)));
    doc.on('error', reject);

    const d = normalizeTTG(payload);
    addHeader(doc);
    addTitle(doc, 'TANDA TERIMA GUDANG', `Nomor: ${d.noTerima}`);

    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text(`Diterima dari : ${d.supplier || '-'}`, MARGIN, doc.y);
    doc.text(`Penerima      : ${d.penerima || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Tanggal       : ${new Date().toLocaleDateString('id-ID')}`, MARGIN, doc.y + LINE);
    doc.moveDown(0.8);

    const pageWidth = doc.page.width - 2 * MARGIN;
    const colW = [30, pageWidth - 100, 35, 35];
    drawTable(doc, {
      cols: [
        { label: 'No', width: colW[0], align: 'center' },
        { label: 'Nama Barang', width: colW[1] },
        { label: 'Qty', width: colW[2], align: 'center' },
        { label: 'Satuan', width: colW[3], align: 'center' },
      ],
      rows: (d.items.length ? d.items : [{ namaBarang: '', qty: '', satuan: '' }]).map((row, idx) =>
        [idx + 1, row.namaBarang, row.qty, row.satuan]
      ),
    });

    const sigY = doc.y + 20;
    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text('Mengetahui', MARGIN, sigY);
    doc.text(d.mengetahui || '........................', MARGIN, sigY + 28);
    doc.text('Pengirim', pageWidth / 2 - 40, sigY);
    doc.text(d.pengirim || '........................', pageWidth / 2 - 40, sigY + 28);
    doc.text('Penerima', pageWidth - 80, sigY);
    doc.text(d.penerima || '........................', pageWidth - 80, sigY + 28);

    doc.end();
  });
}

function buildTTGHtml(payload) {
  const d = normalizeTTG(payload);
  const dateStr = new Date().toLocaleDateString('id-ID');
  const rows = d.items.length ? d.items : [{ namaBarang: '', qty: '', satuan: '' }];
  const body = rows.map((row, idx) =>
    `<tr><td class="tc">${idx + 1}</td><td>${escapeHtml(row.namaBarang)}</td><td class="tc">${row.qty}</td><td class="tc">${escapeHtml(row.satuan)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#111;margin:24px;line-height:1.3;}
h1{font-size:11px;text-align:center;margin:8px 0 4px;}
.meta{font-size:9px;margin:8px 0;}
table{width:100%;border-collapse:collapse;margin:12px 0;}
th,td{border:1px solid #333;padding:4px 6px;text-align:left;}
th{font-weight:700;background:#f5f5f5;}
.tc{text-align:center;}
.sig{display:inline-block;width:30%;margin-top:24px;vertical-align:top;}
.sig span{display:block;border-bottom:1px solid #333;padding-bottom:2px;font-size:8px;margin-bottom:4px;}
</style></head><body>
<p style="font-weight:700;font-size:10px;">MAISA PRIMERIS</p>
<p class="meta">JL. Batang Marao No.9, Padang</p>
<h1>TANDA TERIMA GUDANG</h1>
<p class="meta" style="text-align:center;">Nomor: ${escapeHtml(d.noTerima)}</p>
<div class="meta">
  Diterima dari : ${escapeHtml(d.supplier)} &nbsp;&nbsp; Penerima : ${escapeHtml(d.penerima)}<br>
  Tanggal : ${dateStr}
</div>
<table>
<thead><tr><th class="tc" style="width:28px;">No</th><th>Nama Barang</th><th class="tc" style="width:50px;">Qty</th><th class="tc" style="width:50px;">Satuan</th></tr></thead>
<tbody>${body}</tbody>
</table>
<div class="sig"><span>Mengetahui</span>${escapeHtml(d.mengetahui) || '........................'}</div>
<div class="sig"><span>Pengirim</span>${escapeHtml(d.pengirim) || '........................'}</div>
<div class="sig"><span>Penerima</span>${escapeHtml(d.penerima) || '........................'}</div>
</body></html>`;
}

// ── Barang Keluar ───────────────────────────────────────────────
function normalizeBK(data) {
  const items = (data.items || []).map(i => ({
    namaBarang: i.namaBarang ?? i.item_name ?? '',
    qty: Number(i.qty ?? 0),
    satuan: i.satuan ?? i.unit ?? '',
  }));
  return {
    noForm: data.noForm ?? data.nomor ?? '',
    tujuan: data.tujuan ?? data.penerima ?? '',
    penerima: data.penerima ?? '',
    project: data.project ?? '',
    items,
    disetujui: data.disetujui ?? '',
    diperiksa: data.diperiksa ?? '',
  };
}

function buildBarangKeluarPdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const buf = [];
    doc.on('data', buf.push.bind(buf));
    doc.on('end', () => resolve(Buffer.concat(buf)));
    doc.on('error', reject);

    const d = normalizeBK(payload);
    addHeader(doc);
    addTitle(doc, 'BARANG KELUAR', `Nomor: ${d.noForm}`);

    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text(`Tujuan   : ${d.tujuan || '-'}`, MARGIN, doc.y);
    doc.text(`Penerima : ${d.penerima || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Proyek   : ${d.project || '-'}`, MARGIN, doc.y + LINE);
    doc.moveDown(0.8);

    const pageWidth = doc.page.width - 2 * MARGIN;
    drawTable(doc, {
      cols: [
        { label: 'No', width: 30, align: 'center' },
        { label: 'Nama Barang', width: pageWidth - 100 },
        { label: 'Qty', width: 35, align: 'center' },
        { label: 'Satuan', width: 35, align: 'center' },
      ],
      rows: (d.items.length ? d.items : [{}]).map((row, idx) =>
        [idx + 1, row.namaBarang ?? '', row.qty ?? '', row.satuan ?? '']
      ),
    });

    const sigY = doc.y + 20;
    doc.text('Disetujui', MARGIN, sigY);
    doc.text(d.disetujui || '........................', MARGIN, sigY + 28);
    doc.text('Diperiksa', pageWidth - 80, sigY);
    doc.text(d.diperiksa || '........................', pageWidth - 80, sigY + 28);
    doc.end();
  });
}

function buildBarangKeluarHtml(payload) {
  const d = normalizeBK(payload);
  const rows = (d.items.length ? d.items : [{}]).map((row, idx) =>
    `<tr><td class="tc">${idx + 1}</td><td>${escapeHtml(row.namaBarang ?? '')}</td><td class="tc">${row.qty ?? ''}</td><td class="tc">${escapeHtml(row.satuan ?? '')}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#111;margin:24px;}
h1{font-size:11px;text-align:center;margin:8px 0 4px;}
table{width:100%;border-collapse:collapse;margin:12px 0;}
th,td{border:1px solid #333;padding:4px 6px;}
th{font-weight:700;background:#f5f5f5;}
.tc{text-align:center;}
.sig{display:inline-block;width:30%;margin-top:20px;}
.sig span{display:block;border-bottom:1px solid #333;font-size:8px;margin-bottom:4px;}
</style></head><body>
<p style="font-weight:700;font-size:10px;">MAISA PRIMERIS</p>
<h1>BARANG KELUAR</h1>
<p style="text-align:center;">Nomor: ${escapeHtml(d.noForm)}</p>
<p>Tujuan: ${escapeHtml(d.tujuan)} &nbsp; Penerima: ${escapeHtml(d.penerima)} &nbsp; Proyek: ${escapeHtml(d.project)}</p>
<table>
<thead><tr><th class="tc">No</th><th>Nama Barang</th><th class="tc">Qty</th><th class="tc">Satuan</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="sig"><span>Disetujui</span>${escapeHtml(d.disetujui) || '........................'}</div>
<div class="sig"><span>Diperiksa</span>${escapeHtml(d.diperiksa) || '........................'}</div>
</body></html>`;
}

// ── Surat Jalan ─────────────────────────────────────────────────
function normalizeSJ(data) {
  const items = (data.items || []).map(i => ({
    namaBarang: i.namaBarang ?? i.item_name ?? '',
    jumlah: Number(i.jumlah ?? i.qty ?? 0),
    satuan: i.satuan ?? i.unit ?? '',
    keterangan: i.keterangan ?? '',
  }));
  return {
    nomorSurat: data.nomorSurat ?? data.nomor ?? '',
    tanggal: data.tanggal ?? new Date().toISOString().slice(0, 10),
    nomorPO: data.nomorPO ?? '',
    kepada: data.kepada ?? data.destination ?? '',
    dikirimDengan: data.dikirimDengan ?? '',
    noPolisi: data.noPolisi ?? data.vehicle_no ?? '',
    namaPengemudi: data.namaPengemudi ?? data.driver_name ?? '',
    items,
    mengetahui: data.mengetahui ?? '',
    pengemudi: data.pengemudi ?? '',
  };
}

function buildSuratJalanPdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const buf = [];
    doc.on('data', buf.push.bind(buf));
    doc.on('end', () => resolve(Buffer.concat(buf)));
    doc.on('error', reject);

    const d = normalizeSJ(payload);
    addHeader(doc);
    addTitle(doc, 'SURAT JALAN', `Nomor: ${d.nomorSurat}`);

    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text(`Kepada         : ${d.kepada || '-'}`, MARGIN, doc.y);
    doc.text(`No. PO         : ${d.nomorPO || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Dikirim dengan : ${d.dikirimDengan || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`No. Polisi     : ${d.noPolisi || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Pengemudi      : ${d.namaPengemudi || '-'}`, MARGIN, doc.y + LINE);
    doc.text(`Tanggal        : ${d.tanggal}`, MARGIN, doc.y + LINE);
    doc.moveDown(0.8);

    const pageWidth = doc.page.width - 2 * MARGIN;
    drawTable(doc, {
      cols: [
        { label: 'No', width: 28, align: 'center' },
        { label: 'Nama Barang', width: pageWidth - 120 },
        { label: 'Jumlah', width: 40, align: 'center' },
        { label: 'Satuan', width: 52, align: 'center' },
      ],
      rows: (d.items.length ? d.items : [{}]).map((row, idx) =>
        [idx + 1, row.namaBarang ?? '', row.jumlah ?? '', row.satuan ?? '']
      ),
    });

    const sigY = doc.y + 20;
    doc.text('Mengetahui', MARGIN, sigY);
    doc.text(d.mengetahui || '........................', MARGIN, sigY + 28);
    doc.text('Pengemudi', pageWidth - 80, sigY);
    doc.text(d.pengemudi || d.namaPengemudi || '........................', pageWidth - 80, sigY + 28);
    doc.end();
  });
}

function buildSuratJalanHtml(payload) {
  const d = normalizeSJ(payload);
  const rows = (d.items.length ? d.items : [{}]).map((row, idx) =>
    `<tr><td class="tc">${idx + 1}</td><td>${escapeHtml(row.namaBarang ?? '')}</td><td class="tc">${row.jumlah ?? ''}</td><td class="tc">${escapeHtml(row.satuan ?? '')}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#111;margin:24px;}
h1{font-size:11px;text-align:center;margin:8px 0 4px;}
.meta{margin:8px 0;}
table{width:100%;border-collapse:collapse;margin:12px 0;}
th,td{border:1px solid #333;padding:4px 6px;}
th{font-weight:700;background:#f5f5f5;}
.tc{text-align:center;}
.sig{display:inline-block;width:30%;margin-top:20px;}
.sig span{display:block;border-bottom:1px solid #333;font-size:8px;margin-bottom:4px;}
</style></head><body>
<p style="font-weight:700;font-size:10px;">MAISA PRIMERIS</p>
<h1>SURAT JALAN</h1>
<p style="text-align:center;">Nomor: ${escapeHtml(d.nomorSurat)}</p>
<div class="meta">
  Kepada: ${escapeHtml(d.kepada)} &nbsp; No. PO: ${escapeHtml(d.nomorPO)}<br>
  Dikirim: ${escapeHtml(d.dikirimDengan)} &nbsp; No. Polisi: ${escapeHtml(d.noPolisi)} &nbsp; Pengemudi: ${escapeHtml(d.namaPengemudi)}<br>
  Tanggal: ${d.tanggal}
</div>
<table>
<thead><tr><th class="tc">No</th><th>Nama Barang</th><th class="tc">Jumlah</th><th class="tc">Satuan</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="sig"><span>Mengetahui</span>${escapeHtml(d.mengetahui) || '........................'}</div>
<div class="sig"><span>Pengemudi</span>${escapeHtml(d.pengemudi || d.namaPengemudi) || '........................'}</div>
</body></html>`;
}

// ── Inventaris Lapangan ────────────────────────────────────────
function normalizeInventaris(data) {
  const items = (data.items || []).map(i => ({
    uraian: i.uraian ?? '',
    tanggalPeminjaman: i.tanggalPeminjaman ?? '',
    tanggalPengembalian: i.tanggalPengembalian ?? '',
    satuan: i.satuan ?? '',
    volume: Number(i.volume ?? 0),
    kondisi: i.kondisi ?? 'Baik',
    tandaTangan: i.tandaTangan ?? '',
    lokasi: i.lokasi ?? '',
  }));
  return {
    disetujui: data.disetujui ?? '',
    diperiksa: data.diperiksa ?? '',
    penanggungJawab: data.penanggungJawab ?? '',
    tanggal: data.tanggal ?? new Date().toISOString().slice(0, 10),
    items,
  };
}

function buildInventarisPdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: MARGIN });
    const buf = [];
    doc.on('data', buf.push.bind(buf));
    doc.on('end', () => resolve(Buffer.concat(buf)));
    doc.on('error', reject);

    const d = normalizeInventaris(payload);
    addHeader(doc, 'MAISA PRIMERIS', 'DAFTAR INVENTARIS LAPANGAN');
    addTitle(doc, 'DAFTAR INVENTARIS LAPANGAN');

    const pageWidth = doc.page.width - 2 * MARGIN;
    drawTable(doc, {
      cols: [
        { label: 'No', width: 24, align: 'center' },
        { label: 'Uraian', width: pageWidth * 0.25 },
        { label: 'Lokasi', width: pageWidth * 0.18 },
        { label: 'Tgl Pinjam', width: 70, align: 'center' },
        { label: 'Tgl Kembali', width: 70, align: 'center' },
        { label: 'Volume', width: 50, align: 'center' },
        { label: 'Satuan', width: 50, align: 'center' },
        { label: 'Kondisi', width: pageWidth * 0.18 },
      ],
      rows: (d.items.length ? d.items : [{}]).map((row, idx) => ([
        idx + 1,
        row.uraian ?? '',
        row.lokasi ?? '',
        row.tanggalPeminjaman ?? '',
        row.tanggalPengembalian ?? '',
        row.volume ?? '',
        row.satuan ?? '',
        row.kondisi ?? '',
      ])),
    });

    const sigY = doc.y + 10;
    doc.fontSize(FONT_SIZE).font('Helvetica');
    doc.text('Disetujui', MARGIN, sigY);
    doc.text(d.disetujui || '........................', MARGIN, sigY + 24);
    doc.text('Diperiksa', MARGIN + 160, sigY);
    doc.text(d.diperiksa || '........................', MARGIN + 160, sigY + 24);
    doc.text('Penanggung Jawab', MARGIN + 320, sigY);
    doc.text(d.penanggungJawab || '........................', MARGIN + 320, sigY + 24);
    doc.end();
  });
}

function buildInventarisHtml(payload) {
  const d = normalizeInventaris(payload);
  const rows = (d.items.length ? d.items : [{}]).map((row, idx) =>
    `<tr>
      <td class="tc">${idx + 1}</td>
      <td>${escapeHtml(row.uraian ?? '')}</td>
      <td>${escapeHtml(row.lokasi ?? '')}</td>
      <td class="tc">${escapeHtml(row.tanggalPeminjaman ?? '')}</td>
      <td class="tc">${escapeHtml(row.tanggalPengembalian ?? '')}</td>
      <td class="tc">${row.volume ?? ''}</td>
      <td class="tc">${escapeHtml(row.satuan ?? '')}</td>
      <td>${escapeHtml(row.kondisi ?? '')}</td>
    </tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#111;margin:24px;}
h1{font-size:11px;text-align:center;margin:8px 0 4px;}
table{width:100%;border-collapse:collapse;margin:12px 0;}
th,td{border:1px solid #333;padding:4px 6px;}
th{font-weight:700;background:#f5f5f5;}
.tc{text-align:center;}
.sig{display:inline-block;width:30%;margin-top:16px;}
.sig span{display:block;border-bottom:1px solid #333;font-size:8px;margin-bottom:4px;}
</style></head><body>
<p style="font-weight:700;font-size:10px;">MAISA PRIMERIS</p>
<h1>DAFTAR INVENTARIS LAPANGAN</h1>
<p style="text-align:right;font-size:8px;">Tanggal: ${d.tanggal}</p>
<table>
<thead>
  <tr>
    <th class="tc">No</th>
    <th>Uraian</th>
    <th>Lokasi</th>
    <th class="tc">Tgl Pinjam</th>
    <th class="tc">Tgl Kembali</th>
    <th class="tc">Volume</th>
    <th class="tc">Satuan</th>
    <th>Kondisi</th>
  </tr>
</thead>
<tbody>${rows}</tbody>
</table>
<div class="sig"><span>Disetujui</span>${escapeHtml(d.disetujui) || '........................'}</div>
<div class="sig"><span>Diperiksa</span>${escapeHtml(d.diperiksa) || '........................'}</div>
<div class="sig"><span>Penanggung Jawab</span>${escapeHtml(d.penanggungJawab) || '........................'}</div>
</body></html>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  buildPermintaanPdf,
  buildPermintaanHtml,
  buildTTGPdf,
  buildTTGHtml,
  buildBarangKeluarPdf,
  buildBarangKeluarHtml,
  buildSuratJalanPdf,
  buildSuratJalanHtml,
  buildInventarisPdf,
  buildInventarisHtml,
  normalizeTTG,
  normalizeBK,
  normalizeSJ,
  normalizeInventaris,
};
