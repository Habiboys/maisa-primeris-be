'use strict';

const svc = require('../services/attendance.service');
const { success, created, error } = require('../utils/response');

module.exports = {
  // Work Locations
  listLocations  : async (req, res) => { try { const r = await svc.listLocations();                                   return success(res,r,'Daftar lokasi'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  getLocation    : async (req, res) => { try { const r = await svc.getLocationById(req.params.id);                    return success(res,r,'Detail lokasi'); }                          catch(e){ return error(res,e.message,e.status||500); } },
  createLocation : async (req, res) => { try { const r = await svc.createLocation(req.body);                          return created(res,r,'Lokasi berhasil ditambahkan'); }             catch(e){ return error(res,e.message,e.status||500); } },
  updateLocation : async (req, res) => { try { const r = await svc.updateLocation(req.params.id, req.body);           return success(res,r,'Lokasi berhasil diperbarui'); }             catch(e){ return error(res,e.message,e.status||500); } },
  removeLocation : async (req, res) => { try { await svc.removeLocation(req.params.id);                               return success(res,null,'Lokasi berhasil dinonaktifkan'); }        catch(e){ return error(res,e.message,e.status||500); } },

  // Assignments
  listAssignments  : async (req, res) => { try { const r = await svc.listAssignments();                               return success(res,r,'Daftar assignment'); }                      catch(e){ return error(res,e.message,e.status||500); } },
  createAssignment : async (req, res) => { try { const r = await svc.createAssignment(req.body);                      return created(res,r,'Assignment berhasil dibuat'); }              catch(e){ return error(res,e.message,e.status||500); } },
  removeAssignment : async (req, res) => { try { await svc.removeAssignment(req.params.id);                           return success(res,null,'Assignment berhasil dihapus'); }          catch(e){ return error(res,e.message,e.status||500); } },

  // Attendances
  listAttendances  : async (req, res) => { try { const r = await svc.listAttendances(req.query);                      return res.json({ success:true, ...r, message:'Rekap absensi' }); } catch(e){ return error(res,e.message,e.status||500); } },
  myAttendances    : async (req, res) => { try { const r = await svc.getMyAttendances(req.user.id);                   return success(res,r,'Absensi saya'); }                           catch(e){ return error(res,e.message,e.status||500); } },
  clockIn          : async (req, res) => { try { const r = await svc.clockIn(req.user.id, req.body);                  return created(res,r,'Clock-in berhasil'); }                      catch(e){ return error(res,e.message,e.status||500); } },
  clockOut         : async (req, res) => { try { const r = await svc.clockOut(req.user.id, req.body);                 return success(res,r,'Clock-out berhasil'); }                     catch(e){ return error(res,e.message,e.status||500); } },

  // Leave Requests
  listLeaveRequests  : async (req, res) => { try { const r = await svc.listLeaveRequests(req.query);                  return res.json({ success:true, ...r, message:'Daftar pengajuan' }); } catch(e){ return error(res,e.message,e.status||500); } },
  myLeaveRequests    : async (req, res) => { try { const r = await svc.getMyLeaveRequests(req.user.id);               return success(res,r,'Pengajuan saya'); }                         catch(e){ return error(res,e.message,e.status||500); } },
  createLeaveRequest : async (req, res) => { try { const r = await svc.createLeaveRequest(req.user.id, req.body);     return created(res,r,'Pengajuan berhasil dikirim'); }              catch(e){ return error(res,e.message,e.status||500); } },
  approveLeave       : async (req, res) => { try { const r = await svc.approveLeaveRequest(req.params.id, req.user.id); return success(res,r,'Pengajuan disetujui'); }                 catch(e){ return error(res,e.message,e.status||500); } },
  rejectLeave        : async (req, res) => { try { const r = await svc.rejectLeaveRequest(req.params.id, req.user.id); return success(res,r,'Pengajuan ditolak'); }                   catch(e){ return error(res,e.message,e.status||500); } },
  removeLeaveRequest : async (req, res) => { try { await svc.removeLeaveRequest(req.params.id, req.user.id);           return success(res,null,'Pengajuan berhasil dihapus'); }         catch(e){ return error(res,e.message,e.status||500); } },
};
