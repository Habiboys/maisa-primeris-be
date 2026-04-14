'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = require('express').Router();
const ctrl = require('../controllers/logbookMeeting.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const uploadDir = path.join(__dirname, '../../uploads/logbooks');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({ storage });

router.use(authenticate, ensureTenantContext);

router.get('/job-categories', ctrl.listJobCategories);

router.get('/logbooks', ctrl.listLogbooks);
router.get('/logbooks/:id', ctrl.getLogbook);
router.post('/logbooks', upload.array('files', 10), ctrl.createLogbook);
router.put('/logbooks/:id', ctrl.updateLogbook);
router.delete('/logbooks/:id', ctrl.deleteLogbook);
router.post('/logbooks/:id/files', upload.array('files', 10), ctrl.addLogbookFiles);
router.delete('/logbooks/:id/files/:fileId', ctrl.deleteLogbookFile);

router.get('/meeting-notes', ctrl.listMeetingNotes);
router.get('/meeting-notes/:id', ctrl.getMeetingNote);
router.post('/meeting-notes', ctrl.createMeetingNote);
router.put('/meeting-notes/:id', ctrl.updateMeetingNote);
router.delete('/meeting-notes/:id', ctrl.deleteMeetingNote);
router.get('/meeting-notes/:id/export-pdf', ctrl.exportMeetingNotePdf);

module.exports = router;
