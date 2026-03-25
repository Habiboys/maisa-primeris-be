'use strict';

const svc = require('../services/sop.service');
const pdfSvc = require('../services/sopPdf.service');
const { success, created, error } = require('../utils/response');

function ttgRecordToPayload(r) {
  return {
    noTerima: r.nomor,
    supplier: r.supplier,
    penerima: r.receiver?.name ?? '',
    items: (r.items || []).map(i => ({ namaBarang: i.item_name, qty: i.qty_received, satuan: i.unit })),
    mengetahui: '',
    pengirim: '',
  };
}
function bkRecordToPayload(r) {
  return {
    noForm: r.nomor,
    tujuan: r.received_by,
    penerima: r.received_by,
    project: '',
    items: (r.items || []).map(i => ({ namaBarang: i.item_name, qty: i.qty, satuan: i.unit })),
    disetujui: '',
    diperiksa: '',
  };
}
function sjRecordToPayload(r) {
  return {
    nomorSurat: r.nomor,
    tanggal: r.send_date,
    nomorPO: '',
    kepada: r.destination,
    dikirimDengan: '',
    noPolisi: r.vehicle_no,
    namaPengemudi: r.driver_name,
    items: (r.items || []).map(i => ({ namaBarang: i.item_name, jumlah: i.qty, satuan: i.unit })),
    mengetahui: r.issuer?.name ?? '',
    pengemudi: r.driver_name,
  };
}

function inventarisRecordToPayload(r) {
  return {
    items: [{
      uraian: r.item_name,
      tanggalPeminjaman: r.last_check,
      tanggalPengembalian: '',
      satuan: r.unit,
      volume: r.qty,
      kondisi: r.condition,
      tandaTangan: '',
      lokasi: r.location,
    }],
    disetujui: '',
    diperiksa: '',
    penanggungJawab: r.penanggungJawab ?? '',
    tanggal: r.last_check,
  };
}

module.exports = {
  // Permintaan Material
  listPermintaan  : async (req, res) => { try { const r = await svc.listPermintaan(req.query, req.user);                     return res.json({ success:true, ...r, message:'Daftar permintaan material' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getPermintaan   : async (req, res) => { try { const r = await svc.getPermintaanById(req.params.id, req.user);              return success(res,r,'Detail permintaan'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  createPermintaan: async (req, res) => { try { const r = await svc.createPermintaan(req.body, req.user.id, req.user);       return created(res,r,'Permintaan berhasil dibuat'); }                  catch(e){ return error(res,e.message,e.status||500); } },
  approvePermintaan: async(req, res) => { try { const r = await svc.approvePermintaan(req.params.id, req.user);             return success(res,r,'Permintaan disetujui'); }                        catch(e){ return error(res,e.message,e.status||500); } },
  rejectPermintaan : async(req, res) => { try { const r = await svc.rejectPermintaan(req.params.id, req.user);              return success(res,r,'Permintaan ditolak'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  removePermintaan : async(req, res) => { try { await svc.removePermintaan(req.params.id, req.user);                        return success(res,null,'Permintaan dihapus'); }                       catch(e){ return error(res,e.message,e.status||500); } },

  // Tanda Terima Gudang
  listTTG    : async (req, res) => { try { const r = await svc.listTTG(req.query, req.user);                                return res.json({ success:true, ...r, message:'Daftar TTG' }); }       catch(e){ return error(res,e.message,e.status||500); } },
  createTTG  : async (req, res) => { try { const r = await svc.createTTG(req.body, req.user.id, req.user);                 return created(res,r,'TTG berhasil dibuat'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  verifyTTG  : async (req, res) => { try { const r = await svc.verifyTTG(req.params.id, req.user);                        return success(res,r,'TTG terverifikasi'); }                             catch(e){ return error(res,e.message,e.status||500); } },
  removeTTG  : async (req, res) => { try { await svc.removeTTG(req.params.id, req.user);                                  return success(res,null,'TTG dihapus'); }                                catch(e){ return error(res,e.message,e.status||500); } },

  // Barang Keluar
  listBarangKeluar  : async (req, res) => { try { const r = await svc.listBarangKeluar(req.query, req.user);               return res.json({ success:true, ...r, message:'Daftar barang keluar' }); } catch(e){ return error(res,e.message,e.status||500); } },
  createBarangKeluar: async (req, res) => { try { const r = await svc.createBarangKeluar(req.body, req.user.id, req.user); return created(res,r,'Barang keluar berhasil dicatat'); }               catch(e){ return error(res,e.message,e.status||500); } },
  removeBarangKeluar: async (req, res) => { try { await svc.removeBarangKeluar(req.params.id, req.user);                   return success(res,null,'Barang keluar dihapus'); }                    catch(e){ return error(res,e.message,e.status||500); } },

  // Inventaris
  listInventaris  : async (req, res) => { try { const r = await svc.listInventaris(req.query, req.user);                   return res.json({ success:true, ...r, message:'Daftar inventaris' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getInventaris   : async (req, res) => { try { const r = await svc.getInventarisById(req.params.id, req.user);            return success(res,r,'Detail inventaris'); }                            catch(e){ return error(res,e.message,e.status||500); } },
  createInventaris: async (req, res) => { try { const r = await svc.createInventaris(req.body, req.user);                  return created(res,r,'Inventaris berhasil ditambahkan'); }              catch(e){ return error(res,e.message,e.status||500); } },
  updateInventaris: async (req, res) => { try { const r = await svc.updateInventaris(req.params.id, req.body, req.user);   return success(res,r,'Inventaris berhasil diperbarui'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeInventaris: async (req, res) => { try { await svc.removeInventaris(req.params.id, req.user);                       return success(res,null,'Inventaris berhasil dihapus'); }               catch(e){ return error(res,e.message,e.status||500); } },

  // Surat Jalan
  listSuratJalan      : async (req, res) => { try { const r = await svc.listSuratJalan(req.query, req.user);               return res.json({ success:true, ...r, message:'Daftar surat jalan' }); } catch(e){ return error(res,e.message,e.status||500); } },
  createSuratJalan    : async (req, res) => { try { const r = await svc.createSuratJalan(req.body, req.user.id, req.user); return created(res,r,'Surat jalan berhasil dibuat'); }                 catch(e){ return error(res,e.message,e.status||500); } },
  updateSuratJalanStatus: async(req,res) => { try { const r = await svc.updateSuratJalanStatus(req.params.id, req.body.status, req.user); return success(res,r,'Status diperbarui'); }           catch(e){ return error(res,e.message,e.status||500); } },
  removeSuratJalan    : async (req, res) => { try { await svc.removeSuratJalan(req.params.id, req.user);                   return success(res,null,'Surat jalan dihapus'); }                      catch(e){ return error(res,e.message,e.status||500); } },

  // ── PDF & Preview (server-side generate) ───────────────────────
  previewTTG   : async (req, res) => { try { const html = pdfSvc.buildTTGHtml(req.body);                 return res.type('html').send(html); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfTTG       : async (req, res) => { try { const buf = await pdfSvc.buildTTGPdf(req.body);             res.setHeader('Content-Disposition', 'attachment; filename="TTG.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfTTGById   : async (req, res) => { try { const r = await svc.getTTGById(req.params.id, req.user);     const buf = await pdfSvc.buildTTGPdf(ttgRecordToPayload(r)); res.setHeader('Content-Disposition', 'attachment; filename="TTG.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },

  previewBarangKeluar : async (req, res) => { try { const html = pdfSvc.buildBarangKeluarHtml(req.body); return res.type('html').send(html); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfBarangKeluar     : async (req, res) => { try { const buf = await pdfSvc.buildBarangKeluarPdf(req.body); res.setHeader('Content-Disposition', 'attachment; filename="BarangKeluar.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfBarangKeluarById : async (req, res) => { try { const r = await svc.getBarangKeluarById(req.params.id, req.user); const buf = await pdfSvc.buildBarangKeluarPdf(bkRecordToPayload(r)); res.setHeader('Content-Disposition', 'attachment; filename="BarangKeluar.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },

  previewSuratJalan   : async (req, res) => { try { const html = pdfSvc.buildSuratJalanHtml(req.body);   return res.type('html').send(html); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfSuratJalan       : async (req, res) => { try { const buf = await pdfSvc.buildSuratJalanPdf(req.body); res.setHeader('Content-Disposition', 'attachment; filename="SuratJalan.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfSuratJalanById   : async (req, res) => { try { const r = await svc.getSuratJalanById(req.params.id, req.user); const buf = await pdfSvc.buildSuratJalanPdf(sjRecordToPayload(r)); res.setHeader('Content-Disposition', 'attachment; filename="SuratJalan.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },

  previewInventaris   : async (req, res) => { try { const html = pdfSvc.buildInventarisHtml(req.body);   return res.type('html').send(html); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfInventaris       : async (req, res) => { try { const buf = await pdfSvc.buildInventarisPdf(req.body); res.setHeader('Content-Disposition', 'attachment; filename="Inventaris.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfInventarisById   : async (req, res) => { try { const r = await svc.getInventarisById(req.params.id, req.user); const buf = await pdfSvc.buildInventarisPdf(inventarisRecordToPayload(r)); res.setHeader('Content-Disposition', 'attachment; filename="Inventaris.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },

  previewPermintaan   : async (req, res) => { try { const html = pdfSvc.buildPermintaanHtml(req.body);   return res.type('html').send(html); } catch(e){ return error(res,e.message,e.status||500); } },
  pdfPermintaan       : async (req, res) => { try { const buf = await pdfSvc.buildPermintaanPdf(req.body); res.setHeader('Content-Disposition', 'attachment; filename="PermintaanMaterial.pdf"'); res.type('application/pdf').send(buf); } catch(e){ return error(res,e.message,e.status||500); } },
};
