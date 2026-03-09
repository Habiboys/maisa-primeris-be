'use strict';

const svc = require('../services/housing.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  list        : async (req, res) => { try { const r = await svc.list(req.query);                                  return res.json({ success:true, ...r, message:'Daftar unit' }); }   catch(e){ return error(res,e.message,e.status||500); } },
  getById     : async (req, res) => { try { const r = await svc.getById(req.params.id);                          return success(res,r,'Detail unit'); }                                  catch(e){ return error(res,e.message,e.status||500); } },
  create      : async (req, res) => { try { const r = await svc.create(req.body);                                return created(res,r,'Unit berhasil ditambahkan'); }                    catch(e){ return error(res,e.message,e.status||500); } },
  update      : async (req, res) => { try { const r = await svc.update(req.params.id, req.body);                 return success(res,r,'Unit berhasil diperbarui'); }                    catch(e){ return error(res,e.message,e.status||500); } },
  remove      : async (req, res) => { try { await svc.remove(req.params.id);                                     return success(res,null,'Unit berhasil dihapus'); }                    catch(e){ return error(res,e.message,e.status||500); } },

  listPayments  : async (req, res) => { try { const r = await svc.listPayments(req.params.id);                   return success(res,r,'Riwayat pembayaran'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  createPayment : async (req, res) => { try { const r = await svc.createPayment(req.params.id, req.body);        return created(res,r,'Pembayaran berhasil dicatat'); }                 catch(e){ return error(res,e.message,e.status||500); } },
  updatePayment : async (req, res) => { try { const r = await svc.updatePayment(req.params.id, req.params.pid, req.body); return success(res,r,'Pembayaran diperbarui'); }            catch(e){ return error(res,e.message,e.status||500); } },
  removePayment : async (req, res) => { try { await svc.removePayment(req.params.id, req.params.pid);            return success(res,null,'Pembayaran dihapus'); }                       catch(e){ return error(res,e.message,e.status||500); } },
};
