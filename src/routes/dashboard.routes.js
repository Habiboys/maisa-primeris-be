'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA_FN    = authorize('Super Admin', 'Finance');
const SA_PM    = authorize('Super Admin', 'Project Management');
const SA_FN_PM = authorize('Super Admin', 'Finance', 'Project Management');
const SA       = authorize('Super Admin');

router.use(authenticate);

router.get('/summary',                SA_FN_PM, ctrl.summary);
router.get('/cashflow',               SA_FN,    ctrl.cashflow);
router.get('/construction-progress',  SA_PM,    ctrl.constructionProgress);
router.get('/sales-distribution',     SA,       ctrl.salesDistribution);
router.get('/budget-vs-actual',       SA_FN,    ctrl.budgetVsActual);

module.exports = router;
