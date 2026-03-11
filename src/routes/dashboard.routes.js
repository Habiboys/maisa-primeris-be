'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA_FN_PM = authorize('Super Admin', 'Finance', 'Project Management');

router.use(authenticate);

router.get('/summary',                SA_FN_PM, ctrl.summary);
router.get('/cashflow',               SA_FN_PM, ctrl.cashflow);
router.get('/construction-progress',  SA_FN_PM, ctrl.constructionProgress);
router.get('/sales-distribution',     SA_FN_PM, ctrl.salesDistribution);
router.get('/budget-vs-actual',       SA_FN_PM, ctrl.budgetVsActual);

module.exports = router;
