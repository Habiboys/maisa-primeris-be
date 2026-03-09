'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/finance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA_FN = authorize('Super Admin', 'Finance');
const SA    = authorize('Super Admin');

router.use(authenticate);

// ── Transactions ─────────────────────────────────────────
router.get   ('/transactions/summary',  SA_FN, ctrl.getSummary);
router.get   ('/transactions',          SA_FN, ctrl.listTransactions);
router.post  ('/transactions',          SA_FN, ctrl.createTransaction);
router.get   ('/transactions/:id',      SA_FN, ctrl.getTransaction);
router.put   ('/transactions/:id',      SA_FN, ctrl.updateTransaction);
router.delete('/transactions/:id',      SA,    ctrl.removeTransaction);

// ── Consumers ─────────────────────────────────────────────
router.get   ('/consumers',             SA_FN, ctrl.listConsumers);
router.post  ('/consumers',             SA_FN, ctrl.createConsumer);
router.get   ('/consumers/:id',         SA_FN, ctrl.getConsumer);
router.put   ('/consumers/:id',         SA_FN, ctrl.updateConsumer);
router.delete('/consumers/:id',         SA,    ctrl.removeConsumer);

// ── Payment Histories ─────────────────────────────────────
router.get   ('/consumers/:id/payments',          SA_FN, ctrl.listPayments);
router.post  ('/consumers/:id/payments',          SA_FN, ctrl.createPayment);
router.put   ('/consumers/:id/payments/:pid',     SA_FN, ctrl.updatePayment);
router.delete('/consumers/:id/payments/:pid',     SA,    ctrl.removePayment);

module.exports = router;
