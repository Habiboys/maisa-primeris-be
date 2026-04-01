"use strict";

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ctrl = require("../controllers/project.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { ensureTenantContext } = require("../middlewares/tenant.middleware");

// Multer setup for work log photos
const uploadDir = path.join(__dirname, "../../uploads/work-logs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

// Multer setup for project layout SVG
const layoutUploadDir = path.join(__dirname, "../../uploads/project-layouts");
if (!fs.existsSync(layoutUploadDir)) fs.mkdirSync(layoutUploadDir, { recursive: true });
const layoutStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, layoutUploadDir),
  filename: (_req, _file, cb) => cb(null, `${Date.now()}-layout.svg`),
});
const layoutUpload = multer({ 
  storage: layoutStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/svg+xml" || file.originalname.endsWith(".svg")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file SVG yang diizinkan"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Guards (setiap request wajib punya tenant context untuk scope company_id)
const withTenant = [authenticate, ensureTenantContext];
const requirePM = [authenticate, ensureTenantContext, authorize("Super Admin", "Project Management")];

// Projects
router.get("/projects", withTenant, ctrl.listProjects);
router.get("/projects/:id", withTenant, ctrl.getProject);
router.post("/projects", requirePM, ctrl.createProject);
router.put("/projects/:id", requirePM, ctrl.updateProject);
router.patch("/projects/:id/layout-svg", requirePM, layoutUpload.single("layout_svg"), ctrl.updateProjectLayoutSvg);
router.delete("/projects/:id", requirePM, ctrl.removeProject);

// Units
router.get("/projects/:projectId/units", withTenant, ctrl.listUnits);
router.get("/projects/:projectId/units/:unitNo", withTenant, ctrl.getUnit);
router.post("/projects/:projectId/units", requirePM, ctrl.createUnit);
router.post("/projects/:projectId/bulk-units", requirePM, ctrl.bulkCreateUnits);
router.put("/projects/:projectId/units/:unitNo", requirePM, ctrl.updateUnit);
router.delete("/projects/:projectId/units/:unitNo", requirePM, ctrl.removeUnit);

// Construction statuses
router.get("/construction-statuses", withTenant, ctrl.listConstructionStatuses);
router.post("/construction-statuses", requirePM, ctrl.createConstructionStatus);
router.put("/construction-statuses/:id", requirePM, ctrl.updateConstructionStatus);
router.delete("/construction-statuses/:id", requirePM, ctrl.removeConstructionStatus);

// Time schedule
router.get("/projects/:projectId/time-schedule", withTenant, ctrl.listTimeSchedule);
router.get("/projects/:projectId/units/:unitNo/time-schedule", withTenant, ctrl.listTimeSchedule);
router.post("/projects/:projectId/time-schedule", requirePM, ctrl.createTimeScheduleItem);
router.post("/projects/:projectId/units/:unitNo/time-schedule", requirePM, ctrl.createTimeScheduleItem);
router.put("/projects/:projectId/time-schedule/:itemId", requirePM, ctrl.updateTimeScheduleItem);
router.put("/projects/:projectId/units/:unitNo/time-schedule/:itemId", requirePM, ctrl.updateTimeScheduleItem);

// Inventory
router.get("/projects/:projectId/inventory", withTenant, ctrl.listInventoryLogs);
router.post("/projects/:projectId/inventory", requirePM, ctrl.createInventoryLog);

// Work logs
router.get("/projects/:projectId/work-logs", withTenant, ctrl.listWorkLogs);
router.post("/projects/:projectId/work-logs", requirePM, upload.array("photos", 10), ctrl.createWorkLog);
router.put("/projects/:projectId/work-logs/:logId", requirePM, ctrl.updateWorkLog);
router.delete("/projects/:projectId/work-logs/:logId", requirePM, ctrl.deleteWorkLog);

// Work log photos
router.delete("/projects/:projectId/work-logs/:logId/photos/:photoId", requirePM, ctrl.deleteWorkLogPhoto);
router.post("/projects/:projectId/work-logs/:logId/photos", requirePM, upload.array("photos", 10), ctrl.addWorkLogPhotos);

module.exports = router;
