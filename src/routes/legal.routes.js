'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/legal.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA    = authorize('Super Admin');
const SA_FN = authorize('Super Admin', 'Finance');

router.use(authenticate, ensureTenantContext);

const legalRoutes = (path, handler) => {
  router.get   (`/${path}`,      SA_FN, handler.list);
  router.post  (`/${path}`,      SA_FN, handler.create);
  router.get   (`/${path}/:id`,  SA_FN, handler.getById);
  router.put   (`/${path}/:id`,  SA_FN, handler.update);
  router.delete(`/${path}/:id`,  SA,    handler.remove);
};

legalRoutes('ppjb',        ctrl.ppjb);
legalRoutes('akad',        ctrl.akad);
legalRoutes('bast',        ctrl.bast);
legalRoutes('pindah-unit', ctrl.pindahUnit);
legalRoutes('pembatalan',  ctrl.pembatalan);

module.exports = router;
