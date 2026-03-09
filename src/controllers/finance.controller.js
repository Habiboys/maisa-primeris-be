'use strict';

const svc = require('../services/finance.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  // Transactions
  listTransactions : async (req, res) => { try { const r = await svc.listTransactions(req.query);                         return res.json({ success:true, ...r, message:'Daftar transaksi' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getTransaction   : async (req, res) => { try { const r = await svc.getTransactionById(req.params.id);                  return success(res,r,'Detail transaksi'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createTransaction: async (req, res) => { try { const r = await svc.createTransaction(req.body, req.user.id);           return created(res,r,'Transaksi berhasil dibuat'); }                  catch(e){ return error(res,e.message,e.status||500); } },
  updateTransaction: async (req, res) => { try { const r = await svc.updateTransaction(req.params.id, req.body);         return success(res,r,'Transaksi berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeTransaction: async (req, res) => { try { await svc.removeTransaction(req.params.id);                             return success(res,null,'Transaksi berhasil dihapus'); }              catch(e){ return error(res,e.message,e.status||500); } },
  getSummary       : async (req, res) => { try { const r = await svc.getSummary();                                       return success(res,r,'Ringkasan keuangan'); }                         catch(e){ return error(res,e.message,e.status||500); } },

  // Consumers
  listConsumers : async (req, res) => { try { const r = await svc.listConsumers(req.query);                              return res.json({ success:true, ...r, message:'Daftar konsumen' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getConsumer   : async (req, res) => { try { const r = await svc.getConsumerById(req.params.id);                        return success(res,r,'Detail konsumen'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createConsumer: async (req, res) => { try { const r = await svc.createConsumer(req.body);                              return created(res,r,'Konsumen berhasil ditambahkan'); }              catch(e){ return error(res,e.message,e.status||500); } },
  updateConsumer: async (req, res) => { try { const r = await svc.updateConsumer(req.params.id, req.body);               return success(res,r,'Konsumen berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeConsumer: async (req, res) => { try { await svc.removeConsumer(req.params.id);                                   return success(res,null,'Konsumen berhasil dihapus'); }              catch(e){ return error(res,e.message,e.status||500); } },

  // Payment Histories
  listPayments  : async (req, res) => { try { const r = await svc.listPayments(req.params.id);                          return success(res,r,'Riwayat pembayaran'); }                        catch(e){ return error(res,e.message,e.status||500); } },
  createPayment : async (req, res) => { try { const r = await svc.createPayment(req.params.id, req.body);               return created(res,r,'Pembayaran berhasil dicatat'); }               catch(e){ return error(res,e.message,e.status||500); } },
  updatePayment : async (req, res) => { try { const r = await svc.updatePayment(req.params.id, req.params.pid, req.body); return success(res,r,'Pembayaran berhasil diperbarui'); }          catch(e){ return error(res,e.message,e.status||500); } },
  removePayment : async (req, res) => { try { await svc.removePayment(req.params.id, req.params.pid);                   return success(res,null,'Pembayaran berhasil dihapus'); }            catch(e){ return error(res,e.message,e.status||500); } },
};
