'use strict';

const svc = require('../services/finance.service');
const { success, created, error } = require('../utils/response');

const csvEscape = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

const toCsv = (headers, rows) => {
  const headerLine = headers.map(csvEscape).join(',');
  const body = rows
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
  return `${headerLine}\n${body}`;
};

module.exports = {
  // Transactions
  listTransactions : async (req, res) => { try { const r = await svc.listTransactions(req.query, req.user);                         return res.json({ success:true, ...r, message:'Daftar transaksi' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getTransaction   : async (req, res) => { try { const r = await svc.getTransactionById(req.params.id, req.user);                  return success(res,r,'Detail transaksi'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createTransaction: async (req, res) => { try { const r = await svc.createTransaction(req.body, req.user.id, req.user);           return created(res,r,'Transaksi berhasil dibuat'); }                  catch(e){ return error(res,e.message,e.status||500); } },
  updateTransaction: async (req, res) => { try { const r = await svc.updateTransaction(req.params.id, req.body, req.user);         return success(res,r,'Transaksi berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeTransaction: async (req, res) => { try { await svc.removeTransaction(req.params.id, req.user);                             return success(res,null,'Transaksi berhasil dihapus'); }              catch(e){ return error(res,e.message,e.status||500); } },
  getSummary       : async (req, res) => { try { const r = await svc.getSummary(req.user);                                       return success(res,r,'Ringkasan keuangan'); }                         catch(e){ return error(res,e.message,e.status||500); } },
  exportTransactions: async (req, res) => {
    try {
      const rows = await svc.exportTransactions(req.query, req.user);
      const csv = toCsv(
        ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran', 'Referensi'],
        rows.map((r) => [
          r.transaction_date,
          r.type,
          r.category,
          r.description,
          r.amount,
          r.payment_method || '-',
          r.reference_no || '-',
        ]),
      );

      const ts = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="laporan-transaksi-${ts}.csv"`);
      return res.status(200).send(`\uFEFF${csv}`);
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // Consumers
  listConsumers : async (req, res) => { try { const r = await svc.listConsumers(req.query, req.user);                              return res.json({ success:true, ...r, message:'Daftar konsumen' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getConsumer   : async (req, res) => { try { const r = await svc.getConsumerById(req.params.id, req.user);                        return success(res,r,'Detail konsumen'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createConsumer: async (req, res) => { try { const r = await svc.createConsumer(req.body, req.user);                              return created(res,r,'Konsumen berhasil ditambahkan'); }              catch(e){ return error(res,e.message,e.status||500); } },
  updateConsumer: async (req, res) => { try { const r = await svc.updateConsumer(req.params.id, req.body, req.user);               return success(res,r,'Konsumen berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeConsumer: async (req, res) => { try { await svc.removeConsumer(req.params.id, req.user);                                   return success(res,null,'Konsumen berhasil dihapus'); }              catch(e){ return error(res,e.message,e.status||500); } },
  exportConsumers: async (req, res) => {
    try {
      const rows = await svc.exportConsumers(req.query, req.user);
      const csv = toCsv(
        ['Nama Konsumen', 'Unit', 'Skema', 'Total Harga', 'Sudah Dibayar', 'Sisa Piutang', 'Status', 'Telepon'],
        rows.map((r) => {
          const sisa = Math.max((r.total_price || 0) - (r.paid_amount || 0), 0);
          const status = r.status === 'Lunas' || sisa <= 0 ? 'Lunas' : 'Belum Lunas';
          return [
            r.name,
            r.unit_code || '-',
            r.payment_scheme || '-',
            r.total_price || 0,
            r.paid_amount || 0,
            sisa,
            status,
            r.phone || '-',
          ];
        }),
      );

      const ts = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="laporan-piutang-${ts}.csv"`);
      return res.status(200).send(`\uFEFF${csv}`);
    } catch (e) {
      return error(res, e.message, e.status || 500);
    }
  },

  // Payment Histories
  listPayments  : async (req, res) => { try { const r = await svc.listPayments(req.params.id, req.user);                          return success(res,r,'Riwayat pembayaran'); }                        catch(e){ return error(res,e.message,e.status||500); } },
  createPayment : async (req, res) => { try { const r = await svc.createPayment(req.params.id, req.body, req.user);               return created(res,r,'Pembayaran berhasil dicatat'); }               catch(e){ return error(res,e.message,e.status||500); } },
  updatePayment : async (req, res) => { try { const r = await svc.updatePayment(req.params.id, req.params.pid, req.body, req.user); return success(res,r,'Pembayaran berhasil diperbarui'); }          catch(e){ return error(res,e.message,e.status||500); } },
  removePayment : async (req, res) => { try { await svc.removePayment(req.params.id, req.params.pid, req.user);                   return success(res,null,'Pembayaran berhasil dihapus'); }            catch(e){ return error(res,e.message,e.status||500); } },
};
