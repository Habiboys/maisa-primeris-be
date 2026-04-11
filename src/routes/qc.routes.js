"use strict";

const router = require("express").Router();
const ctrl = require("../controllers/qc.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { ensureTenantContext } = require("../middlewares/tenant.middleware");

const requireSA = [authenticate, ensureTenantContext, authorize("Super Admin")];
const requireSAPM = [authenticate, ensureTenantContext, authorize("Super Admin", "Project Management")];

// Templates
router.get("/qc-templates", requireSAPM, ctrl.listTemplates);
router.get("/qc-templates/:id", requireSAPM, ctrl.getTemplate);
router.post("/qc-templates", requireSA, ctrl.createTemplate);
router.put("/qc-templates/:id", requireSA, ctrl.updateTemplate);
router.delete("/qc-templates/:id", requireSA, ctrl.removeTemplate);
router.post("/qc-templates/:id/duplicate", requireSA, ctrl.duplicateTemplate);

// Sections
router.post("/qc-templates/:id/sections", requireSA, ctrl.createSection);
router.put("/qc-templates/:id/sections/:sectionId", requireSA, ctrl.updateSection);
router.delete("/qc-templates/:id/sections/:sectionId", requireSA, ctrl.removeSection);

// Items
router.post("/qc-templates/:id/sections/:sectionId/items", requireSA, ctrl.createItem);
router.put("/qc-templates/:id/sections/:sectionId/items/:itemId", requireSA, ctrl.updateItem);
router.delete("/qc-templates/:id/sections/:sectionId/items/:itemId", requireSA, ctrl.removeItem);

// Submissions
router.get("/qc-submissions", requireSAPM, ctrl.listSubmissions);
router.get("/qc-submissions-export/project/:projectId", requireSAPM, ctrl.exportProjectSubmissions);
router.get("/qc-submissions/:id", requireSAPM, ctrl.getSubmission);
router.post("/qc-submissions", requireSAPM, ctrl.createSubmission);
router.put("/qc-submissions/:id", requireSAPM, ctrl.updateSubmission);
router.patch("/qc-submissions/:id/submit", requireSAPM, ctrl.submitSubmission);
router.delete("/qc-submissions/:id", requireSA, ctrl.removeSubmission);
router.get("/qc-submissions/:id/export", requireSAPM, ctrl.exportSubmission);

module.exports = router;
