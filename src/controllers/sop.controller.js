'use strict';

const svc = require('../services/sop.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  // Permintaan Material
  listPermintaan  : async (req, res) => { try { const r = await svc.listPermintaan(req.query);                     return res.json({ success:true, ...r, message:'Daftar permintaan material' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getPermintaan   : async (req, res) => { try { const r = await svc.getPermintaanById(req.params.id);              return success(res,r,'Detail permintaan'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createPermintaan: async (req, res) => { try { const r = await svc.createPermintaan(req.body, req.user.id);       return created(res,r,'Permintaan berhasil dibuat'); }                  catch(e){ return error(res,e.message,e.status||500); } },
  approvePermintaan: async(req, res) => { try { const r = await svc.approvePermintaan(req.params.id);             return success(res,r,'Permintaan disetujui'); }                        catch(e){ return error(res,e.message,e.status||500); } },
  rejectPermintaan : async(req, res) => { try { const r = await svc.rejectPermintaan(req.params.id);              return success(res,r,'Permintaan ditolak'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  removePermintaan : async(req, res) => { try { await svc.removePermintaan(req.params.id);                        return success(res,null,'Permintaan dihapus'); }                       catch(e){ return error(res,e.message,e.status||500); } },

  // Tanda Terima Gudang
  listTTG    : async (req, res) => { try { const r = await svc.listTTG(req.query);                                return res.json({ success:true, ...r, message:'Daftar TTG' }); }       catch(e){ return error(res,e.message,e.status||500); } },
  createTTG  : async (req, res) => { try { const r = await svc.createTTG(req.body, req.user.id);                 return created(res,r,'TTG berhasil dibuat'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  verifyTTG  : async (req, res) => { try { const r = await svc.verifyTTG(req.params.id);                        return success(res,r,'TTG terverifikasi'); }                             catch(e){ return error(res,e.message,e.status||500); } },
  removeTTG  : async (req, res) => { try { await svc.removeTTG(req.params.id);                                  return success(res,null,'TTG dihapus'); }                                catch(e){ return error(res,e.message,e.status||500); } },

  // Barang Keluar
  listBarangKeluar  : async (req, res) => { try { const r = await svc.listBarangKeluar(req.query);               return res.json({ success:true, ...r, message:'Daftar barang keluar' }); } catch(e){ return error(res,e.message,e.status||500); } },
  createBarangKeluar: async (req, res) => { try { const r = await svc.createBarangKeluar(req.body, req.user.id); return created(res,r,'Barang keluar berhasil dicatat'); }               catch(e){ return error(res,e.message,e.status||500); } },
  removeBarangKeluar: async (req, res) => { try { await svc.removeBarangKeluar(req.params.id);                   return success(res,null,'Barang keluar dihapus'); }                    catch(e){ return error(res,e.message,e.status||500); } },

  // Inventaris
  listInventaris  : async (req, res) => { try { const r = await svc.listInventaris(req.query);                   return res.json({ success:true, ...r, message:'Daftar inventaris' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getInventaris   : async (req, res) => { try { const r = await svc.getInventarisById(req.params.id);            return success(res,r,'Detail inventaris'); }                            catch(e){ return error(res,e.message,e.status||500); } },
  createInventaris: async (req, res) => { try { const r = await svc.createInventaris(req.body);                  return created(res,r,'Inventaris berhasil ditambahkan'); }              catch(e){ return error(res,e.message,e.status||500); } },
  updateInventaris: async (req, res) => { try { const r = await svc.updateInventaris(req.params.id, req.body);   return success(res,r,'Inventaris berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeInventaris: async (req, res) => { try { await svc.removeInventaris(req.params.id);                       return success(res,null,'Inventaris berhasil dihapus'); }               catch(e){ return error(res,e.message,e.status||500); } },

  // Surat Jalan
  listSuratJalan      : async (req, res) => { try { const r = await svc.listSuratJalan(req.query);               return res.json({ success:true, ...r, message:'Daftar surat jalan' }); } catch(e){ return error(res,e.message,e.status||500); } },
  createSuratJalan    : async (req, res) => { try { const r = await svc.createSuratJalan(req.body, req.user.id); return created(res,r,'Surat jalan berhasil dibuat'); }                 catch(e){ return error(res,e.message,e.status||500); } },
  updateSuratJalanStatus: async(req,res) => { try { const r = await svc.updateSuratJalanStatus(req.params.id, req.body.status); return success(res,r,'Status diperbarui'); }           catch(e){ return error(res,e.message,e.status||500); } },
  removeSuratJalan    : async (req, res) => { try { await svc.removeSuratJalan(req.params.id);                   return success(res,null,'Surat jalan dihapus'); }                      catch(e){ return error(res,e.message,e.status||500); } },
};
