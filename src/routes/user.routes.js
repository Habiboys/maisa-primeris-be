'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA = authorize('Super Admin');

router.use(authenticate, ensureTenantContext);

// Fixed-path routes MUST come before /:id
router.get('/activity-logs', SA, ctrl.activityLogs);

router.get   ('/',              SA, ctrl.list);
router.post  ('/',              SA, ctrl.create);
router.get   ('/:id',           SA, ctrl.getById);
router.put   ('/:id',           SA, ctrl.update);
router.patch ('/:id/toggle-status', SA, ctrl.toggleStatus);
router.delete('/:id',           SA, ctrl.remove);

module.exports = router;
