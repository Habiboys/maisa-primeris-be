'use strict';

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl   = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA       = authorize('Super Admin');
const SA_FN_PM = authorize('Super Admin', 'Finance', 'Project Management');
const ALL      = (req, res, next) => next(); // all authenticated users

// Multer setup for attendance photos
const uploadDir = path.join(__dirname, '../../uploads/attendance');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage });

router.use(authenticate, ensureTenantContext);

// Attendance Settings — read for authenticated users, write SA only
router.get   ('/attendance-settings',      ALL,      ctrl.getAttendanceSettings);
router.put   ('/attendance-settings',      SA,       ctrl.updateAttendanceSettings);

// Work Locations — read accessible to all roles (needed for clock-in map), write SA only
router.get   ('/work-locations',      ALL,      ctrl.listLocations);
router.post  ('/work-locations',      SA,       ctrl.createLocation);
router.get   ('/work-locations/:id',  ALL,      ctrl.getLocation);
router.put   ('/work-locations/:id',  SA,       ctrl.updateLocation);
router.delete('/work-locations/:id',  SA,       ctrl.removeLocation);

// User-Location Assignments — read for all roles, write SA only
router.get   ('/user-location-assignments',      SA_FN_PM, ctrl.listAssignments);
router.post  ('/user-location-assignments',      SA,       ctrl.createAssignment);
router.delete('/user-location-assignments/:id',  SA,       ctrl.removeAssignment);

// Attendances (fixed paths before params)
router.get   ('/attendances/my',        ALL,      ctrl.myAttendances);
router.get   ('/attendances',           SA_FN_PM, ctrl.listAttendances);
router.post  ('/attendances/clock-in',  ALL,      upload.single('photo'), ctrl.clockIn);
router.post  ('/attendances/clock-out', ALL,      upload.single('photo'), ctrl.clockOut);

// Leave Requests — read for all roles, approve/reject SA only
router.get   ('/leave-requests/my',          ALL,      ctrl.myLeaveRequests);
router.get   ('/leave-requests',             SA_FN_PM, ctrl.listLeaveRequests);
router.post  ('/leave-requests',             ALL,      ctrl.createLeaveRequest);
router.patch ('/leave-requests/:id/approve', SA,       ctrl.approveLeave);
router.patch ('/leave-requests/:id/reject',  SA,       ctrl.rejectLeave);
router.delete('/leave-requests/:id',         ALL,      ctrl.removeLeaveRequest);

module.exports = router;
