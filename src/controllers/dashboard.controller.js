'use strict';

const svc = require('../services/dashboard.service');
const { success, error } = require('../utils/response');

module.exports = {
  summary            : async (req, res) => { try { return success(res, await svc.getSummary(),              'Ringkasan dashboard'); }          catch(e){ return error(res,e.message,e.status||500); } },
  cashflow           : async (req, res) => { try { return success(res, await svc.getCashflow(req.query.months), 'Data cashflow'); }           catch(e){ return error(res,e.message,e.status||500); } },
  salesDistribution  : async (req, res) => { try { return success(res, await svc.getSalesDistribution(),    'Distribusi penjualan'); }        catch(e){ return error(res,e.message,e.status||500); } },
  constructionProgress: async(req, res) => { try { return success(res, await svc.getConstructionProgress(), 'Progres konstruksi'); }          catch(e){ return error(res,e.message,e.status||500); } },
  budgetVsActual     : async (req, res) => { try { return success(res, await svc.getBudgetVsActual(),        'Budget vs aktual'); }           catch(e){ return error(res,e.message,e.status||500); } },
};
