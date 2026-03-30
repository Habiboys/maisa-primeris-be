'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/marketing.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA = authorize('Super Admin', 'Finance');

router.use(authenticate, ensureTenantContext);

// Leads (fixed paths first)
router.get   ('/leads/stats', SA, ctrl.getLeadStats);
router.get   ('/leads',       SA, ctrl.listLeads);
router.post  ('/leads',       SA, ctrl.createLead);
router.get   ('/leads/:id',   SA, ctrl.getLead);
router.put   ('/leads/:id',   SA, ctrl.updateLead);
router.delete('/leads/:id',   SA, ctrl.removeLead);

// Marketing Persons
router.get   ('/marketing-persons',      SA, ctrl.listPersons);
router.post  ('/marketing-persons',      SA, ctrl.createPerson);
router.get   ('/marketing-persons/:id',  SA, ctrl.getPerson);
router.put   ('/marketing-persons/:id',  SA, ctrl.updatePerson);
router.delete('/marketing-persons/:id',  SA, ctrl.removePerson);

// Unit Statuses
router.get('/unit-statuses',            SA, ctrl.listUnitStatuses);
router.put('/unit-statuses/:unitNo',    SA, ctrl.updateUnitStatus);

module.exports = router;
