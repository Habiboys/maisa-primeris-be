'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentScheme.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.listPaymentSchemes);
router.post('/', ctrl.createPaymentScheme);
router.put('/:id', ctrl.updatePaymentScheme);
router.delete('/:id', ctrl.deletePaymentScheme);

module.exports = router;
