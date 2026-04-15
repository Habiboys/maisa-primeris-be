'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = require('express').Router();
const ctrl = require('../controllers/media.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');
const { enforceAndCompressUploadedImages } = require('../middlewares/image-upload.middleware');

const uploadDir = path.join(__dirname, '../../uploads/media');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${(file.originalname || 'media').replace(/[^a-zA-Z0-9.-]/g, '_')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) return cb(null, true);
    return cb(new Error('Hanya file gambar yang diizinkan (maks 2MB)'));
  },
});

router.use(authenticate, ensureTenantContext);

router.get('/media', authorize('Platform Owner', 'Super Admin', 'Finance', 'Project Management', 'Sekretaris'), ctrl.list);
router.post('/media/upload', authorize('Platform Owner', 'Super Admin', 'Finance', 'Project Management', 'Sekretaris'), upload.single('file'), enforceAndCompressUploadedImages(), ctrl.upload);
router.delete('/media/:id', authorize('Platform Owner', 'Super Admin', 'Finance', 'Project Management', 'Sekretaris'), ctrl.remove);

module.exports = router;
