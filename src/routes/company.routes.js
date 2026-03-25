'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/company.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const PLATFORM = authorize('Platform Owner');

router.use(authenticate, PLATFORM);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
