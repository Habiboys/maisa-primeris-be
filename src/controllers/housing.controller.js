'use strict';

const svc = require('../services/housing.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  list        : async (req, res) => { try { const r = await svc.list(req.query, req.user);                                  return res.json({ success:true, ...r, message:'Daftar unit' }); }   catch(e){ return error(res,e.message,e.status||500); } },
  getById     : async (req, res) => { try { const r = await svc.getById(req.params.id, req.user);                          return success(res,r,'Detail unit'); }                                  catch(e){ return error(res,e.message,e.status||500); } },
  create      : async (req, res) => { try { const photo = req.file ? `/uploads/housing-units/${req.file.filename}` : undefined; const r = await svc.create({ ...req.body, photo_url: photo }, req.user); return created(res,r,'Unit berhasil ditambahkan'); } catch(e){ return error(res,e.message,e.status||500); } },
  update      : async (req, res) => { try { const photo = req.file ? `/uploads/housing-units/${req.file.filename}` : undefined; const payload = { ...req.body }; if (photo) payload.photo_url = photo; const r = await svc.update(req.params.id, payload, req.user); return success(res,r,'Unit berhasil diperbarui'); } catch(e){ return error(res,e.message,e.status||500); } },
  remove      : async (req, res) => { try { await svc.remove(req.params.id, req.user);                                     return success(res,null,'Unit berhasil dihapus'); }                    catch(e){ return error(res,e.message,e.status||500); } },

  listPayments  : async (req, res) => { try { const r = await svc.listPayments(req.params.id, req.user);                   return success(res,r,'Riwayat pembayaran'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  createPayment : async (req, res) => { try { const r = await svc.createPayment(req.params.id, req.body, req.user);        return created(res,r,'Pembayaran berhasil dicatat'); }                 catch(e){ return error(res,e.message,e.status||500); } },
  updatePayment : async (req, res) => { try { const r = await svc.updatePayment(req.params.id, req.params.pid, req.body, req.user); return success(res,r,'Pembayaran diperbarui'); }            catch(e){ return error(res,e.message,e.status||500); } },
  removePayment : async (req, res) => { try { await svc.removePayment(req.params.id, req.params.pid, req.user);            return success(res,null,'Pembayaran dihapus'); }                       catch(e){ return error(res,e.message,e.status||500); } },
};
