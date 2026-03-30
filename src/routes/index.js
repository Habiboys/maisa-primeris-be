'use strict';

const router = require('express').Router();

router.use('/auth',       require('./auth.routes'));
router.use('/users',      require('./user.routes'));
router.use('/companies',  require('./company.routes'));
router.use('/company-settings', require('./companySetting.routes'));
router.use('/departments', require('./department.routes'));
router.use('/materials',   require('./material.routes'));
router.use('/',           require('./finance.routes'));      // /transactions + /consumers
router.use('/',           require('./marketing.routes'));    // /leads + /marketing-persons + /unit-statuses
router.use('/',           require('./housing.routes'));      // /housing
router.use('/',           require('./legal.routes'));        // /ppjb + /akad + /bast + /pindah-unit + /pembatalan
router.use('/',           require('./attendance.routes'));   // /work-locations + /attendances + /leave-requests
router.use('/',           require('./sop.routes'));          // /material-requests + /warehouse-receipts + /goods-out + /inventory + /delivery-orders
router.use('/dashboard',  require('./dashboard.routes'));    // /dashboard/*
router.use('/',           require('./project.routes'));      // /projects + /construction-statuses + time-schedule + inventory + work-logs
router.use('/',           require('./qc.routes'));           // /qc-templates + /qc-submissions

module.exports = router;
