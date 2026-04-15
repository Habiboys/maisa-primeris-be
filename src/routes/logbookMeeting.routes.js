'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = require('express').Router();
const ctrl = require('../controllers/logbookMeeting.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');
const { enforceAndCompressUploadedImages } = require('../middlewares/image-upload.middleware');

const uploadDir = path.join(__dirname, '../../uploads/logbooks');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({
  storage,
  limits: {
    // Rich editor bisa mengirim HTML panjang (termasuk embed image/base64)
    fieldSize: 20 * 1024 * 1024,
    fileSize: 10 * 1024 * 1024,
    fields: 50,
    files: 10,
  },
});

const uploadFiles = (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'Upload gagal',
        error: err.message,
      });
    }
    return next(err);
  });
};

router.use(authenticate, ensureTenantContext);

router.get('/job-categories', ctrl.listJobCategories);

router.get('/logbooks', ctrl.listLogbooks);
router.get('/logbooks/:id', ctrl.getLogbook);
router.post('/logbooks', uploadFiles, enforceAndCompressUploadedImages(), ctrl.createLogbook);
router.put('/logbooks/:id', ctrl.updateLogbook);
router.delete('/logbooks/:id', ctrl.deleteLogbook);
router.post('/logbooks/:id/files', uploadFiles, enforceAndCompressUploadedImages(), ctrl.addLogbookFiles);
router.delete('/logbooks/:id/files/:fileId', ctrl.deleteLogbookFile);

router.get('/meeting-notes', ctrl.listMeetingNotes);
router.get('/meeting-notes/:id', ctrl.getMeetingNote);
router.post('/meeting-notes', ctrl.createMeetingNote);
router.put('/meeting-notes/:id', ctrl.updateMeetingNote);
router.delete('/meeting-notes/:id', ctrl.deleteMeetingNote);
router.get('/meeting-notes/:id/export-pdf', ctrl.exportMeetingNotePdf);

module.exports = router;
