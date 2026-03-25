'use strict';

const svc = require('../services/marketing.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  // Leads
  listLeads  : async (req, res) => { try { const r = await svc.listLeads(req.query, req.user);                       return res.json({ success:true, ...r, message:'Daftar leads' }); }  catch(e){ return error(res,e.message,e.status||500); } },
  getLead    : async (req, res) => { try { const r = await svc.getLeadById(req.params.id, req.user);                 return success(res,r,'Detail lead'); }                                 catch(e){ return error(res,e.message,e.status||500); } },
  createLead : async (req, res) => { try { const r = await svc.createLead(req.body, req.user);                       return created(res,r,'Lead berhasil ditambahkan'); }                   catch(e){ return error(res,e.message,e.status||500); } },
  updateLead : async (req, res) => { try { const r = await svc.updateLead(req.params.id, req.body, req.user);        return success(res,r,'Lead berhasil diperbarui'); }                    catch(e){ return error(res,e.message,e.status||500); } },
  removeLead : async (req, res) => { try { await svc.removeLead(req.params.id, req.user);                            return success(res,null,'Lead berhasil dihapus'); }                    catch(e){ return error(res,e.message,e.status||500); } },
  getLeadStats: async(req, res) => { try { const r = await svc.getLeadStats(req.user);                             return success(res,r,'Statistik leads'); }                             catch(e){ return error(res,e.message,e.status||500); } },

  // Marketing Persons
  listPersons  : async (req, res) => { try { const r = await svc.listMarketingPersons(req.query, req.user);           return res.json({ success:true, ...r, message:'Daftar marketing' }); } catch(e){ return error(res,e.message,e.status||500); } },
  getPerson    : async (req, res) => { try { const r = await svc.getMarketingPersonById(req.params.id, req.user);     return success(res,r,'Detail marketing person'); }                      catch(e){ return error(res,e.message,e.status||500); } },
  createPerson : async (req, res) => { try { const r = await svc.createMarketingPerson(req.body, req.user);            return created(res,r,'Marketing person ditambahkan'); }                  catch(e){ return error(res,e.message,e.status||500); } },
  updatePerson : async (req, res) => { try { const r = await svc.updateMarketingPerson(req.params.id, req.body, req.user); return success(res,r,'Marketing person diperbarui'); }            catch(e){ return error(res,e.message,e.status||500); } },
  removePerson : async (req, res) => { try { await svc.removeMarketingPerson(req.params.id, req.user);                 return success(res,null,'Marketing person dihapus'); }                  catch(e){ return error(res,e.message,e.status||500); } },

  // Unit Statuses
  listUnitStatuses  : async (req, res) => { try { const r = await svc.listUnitStatuses(req.user);                        return success(res,r,'Status unit'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  updateUnitStatus  : async (req, res) => { try { const r = await svc.updateUnitStatus(req.params.unitNo, req.body, req.user); return success(res,r,'Status unit diperbarui'); }          catch(e){ return error(res,e.message,e.status||500); } },
};
