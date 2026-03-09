'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA  = authorize('Super Admin');
const ALL = (req, res, next) => next(); // all authenticated users

router.use(authenticate);

// Work Locations
router.get   ('/work-locations',      SA,  ctrl.listLocations);
router.post  ('/work-locations',      SA,  ctrl.createLocation);
router.get   ('/work-locations/:id',  SA,  ctrl.getLocation);
router.put   ('/work-locations/:id',  SA,  ctrl.updateLocation);
router.delete('/work-locations/:id',  SA,  ctrl.removeLocation);

// User-Location Assignments
router.get   ('/user-location-assignments',      SA,  ctrl.listAssignments);
router.post  ('/user-location-assignments',      SA,  ctrl.createAssignment);
router.delete('/user-location-assignments/:id',  SA,  ctrl.removeAssignment);

// Attendances (fixed paths before params)
router.get   ('/attendances/my',        ALL, ctrl.myAttendances);
router.get   ('/attendances',           SA,  ctrl.listAttendances);
router.post  ('/attendances/clock-in',  ALL, ctrl.clockIn);
router.post  ('/attendances/clock-out', ALL, ctrl.clockOut);

// Leave Requests
router.get   ('/leave-requests/my',          ALL, ctrl.myLeaveRequests);
router.get   ('/leave-requests',             SA,  ctrl.listLeaveRequests);
router.post  ('/leave-requests',             ALL, ctrl.createLeaveRequest);
router.patch ('/leave-requests/:id/approve', SA,  ctrl.approveLeave);
router.patch ('/leave-requests/:id/reject',  SA,  ctrl.rejectLeave);
router.delete('/leave-requests/:id',         ALL, ctrl.removeLeaveRequest);

module.exports = router;
