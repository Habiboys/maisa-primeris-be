'use strict';

const svc = require('../services/legal.service');
const { success, created, error } = require('../utils/response');

const makeHandler = (module, label) => ({
  list  : async (req, res) => { try { const r = await svc[module].list(req.query);               return res.json({ success:true, ...r, message:`Daftar ${label}` }); } catch(e){ return error(res,e.message,e.status||500); } },
  getById: async(req, res) => { try { const r = await svc[module].getById(req.params.id);        return success(res,r,`Detail ${label}`); }                           catch(e){ return error(res,e.message,e.status||500); } },
  create : async (req, res) => { try { const r = await svc[module].create(req.body);             return created(res,r,`${label} berhasil ditambahkan`); }             catch(e){ return error(res,e.message,e.status||500); } },
  update : async (req, res) => { try { const r = await svc[module].update(req.params.id,req.body); return success(res,r,`${label} berhasil diperbarui`); }           catch(e){ return error(res,e.message,e.status||500); } },
  remove : async (req, res) => { try { await svc[module].remove(req.params.id);                  return success(res,null,`${label} berhasil dihapus`); }              catch(e){ return error(res,e.message,e.status||500); } },
});

module.exports = {
  ppjb      : makeHandler('ppjb',       'PPJB'),
  akad      : makeHandler('akad',       'Akad'),
  bast      : makeHandler('bast',       'BAST'),
  pindahUnit: makeHandler('pindahUnit', 'Pindah Unit'),
  pembatalan: makeHandler('pembatalan', 'Pembatalan'),
};
