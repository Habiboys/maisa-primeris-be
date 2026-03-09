"use strict";

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ctrl = require("../controllers/project.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Multer setup for work log photos
const uploadDir = path.join(__dirname, "../../uploads/work-logs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

// Guards
const requirePM = [authenticate, authorize("Super Admin", "Project Management")];

// Projects
router.get("/projects", authenticate, ctrl.listProjects);
router.get("/projects/:id", authenticate, ctrl.getProject);
router.post("/projects", requirePM, ctrl.createProject);
router.put("/projects/:id", requirePM, ctrl.updateProject);
router.delete("/projects/:id", requirePM, ctrl.removeProject);

// Units
router.get("/projects/:projectId/units", authenticate, ctrl.listUnits);
router.get("/projects/:projectId/units/:unitNo", authenticate, ctrl.getUnit);
router.post("/projects/:projectId/units", requirePM, ctrl.createUnit);
router.put("/projects/:projectId/units/:unitNo", requirePM, ctrl.updateUnit);
router.delete("/projects/:projectId/units/:unitNo", requirePM, ctrl.removeUnit);

// Construction statuses
router.get("/construction-statuses", authenticate, ctrl.listConstructionStatuses);
router.post("/construction-statuses", requirePM, ctrl.createConstructionStatus);
router.put("/construction-statuses/:id", requirePM, ctrl.updateConstructionStatus);
router.delete("/construction-statuses/:id", requirePM, ctrl.removeConstructionStatus);

// Time schedule
router.get("/projects/:projectId/time-schedule", authenticate, ctrl.listTimeSchedule);
router.get("/projects/:projectId/units/:unitNo/time-schedule", authenticate, ctrl.listTimeSchedule);
router.post("/projects/:projectId/time-schedule", requirePM, ctrl.createTimeScheduleItem);
router.post("/projects/:projectId/units/:unitNo/time-schedule", requirePM, ctrl.createTimeScheduleItem);
router.put("/projects/:projectId/time-schedule/:itemId", requirePM, ctrl.updateTimeScheduleItem);
router.put("/projects/:projectId/units/:unitNo/time-schedule/:itemId", requirePM, ctrl.updateTimeScheduleItem);

// Inventory
router.get("/projects/:projectId/inventory", authenticate, ctrl.listInventoryLogs);
router.post("/projects/:projectId/inventory", requirePM, ctrl.createInventoryLog);

// Work logs
router.get("/projects/:projectId/work-logs", authenticate, ctrl.listWorkLogs);
router.post("/projects/:projectId/work-logs", requirePM, upload.array("photos", 10), ctrl.createWorkLog);
router.put("/projects/:projectId/work-logs/:logId", requirePM, ctrl.updateWorkLog);

module.exports = router;
