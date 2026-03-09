'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/marketing.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA = authorize('Super Admin');

router.use(authenticate, SA);

// Leads (fixed paths first)
router.get   ('/leads/stats', ctrl.getLeadStats);
router.get   ('/leads',       ctrl.listLeads);
router.post  ('/leads',       ctrl.createLead);
router.get   ('/leads/:id',   ctrl.getLead);
router.put   ('/leads/:id',   ctrl.updateLead);
router.delete('/leads/:id',   ctrl.removeLead);

// Marketing Persons
router.get   ('/marketing-persons',      ctrl.listPersons);
router.post  ('/marketing-persons',      ctrl.createPerson);
router.get   ('/marketing-persons/:id',  ctrl.getPerson);
router.put   ('/marketing-persons/:id',  ctrl.updatePerson);
router.delete('/marketing-persons/:id',  ctrl.removePerson);

// Unit Statuses
router.get('/unit-statuses',            ctrl.listUnitStatuses);
router.put('/unit-statuses/:unitNo',    ctrl.updateUnitStatus);

module.exports = router;
