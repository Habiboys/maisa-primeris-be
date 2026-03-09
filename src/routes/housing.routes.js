'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/housing.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA    = authorize('Super Admin');
const SA_FN = authorize('Super Admin', 'Finance');

router.use(authenticate);

router.get   ('/housing',          SA,    ctrl.list);
router.post  ('/housing',          SA,    ctrl.create);
router.get   ('/housing/:id',      SA,    ctrl.getById);
router.put   ('/housing/:id',      SA,    ctrl.update);
router.delete('/housing/:id',      SA,    ctrl.remove);

router.get   ('/housing/:id/payments',          SA_FN, ctrl.listPayments);
router.post  ('/housing/:id/payments',          SA_FN, ctrl.createPayment);
router.put   ('/housing/:id/payments/:pid',     SA_FN, ctrl.updatePayment);
router.delete('/housing/:id/payments/:pid',     SA,    ctrl.removePayment);

module.exports = router;
