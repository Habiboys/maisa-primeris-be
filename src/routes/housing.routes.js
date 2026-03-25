'use strict';

const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/housing.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA = authorize('Super Admin');
const SA_FN = authorize('Super Admin', 'Finance');

const uploadDir = path.join(__dirname, '../../uploads/housing-units');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${(file.originalname || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png)$/i.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Hanya file PNG, JPG, atau JPEG (max 5MB)'));
  },
});

router.use(authenticate, ensureTenantContext);

router.get   ('/housing',          SA,    ctrl.list);
router.post  ('/housing',          SA,    upload.single('photo'), ctrl.create);
router.get   ('/housing/:id',      SA,    ctrl.getById);
router.put   ('/housing/:id',      SA,    upload.single('photo'), ctrl.update);
router.delete('/housing/:id',      SA,    ctrl.remove);

router.get   ('/housing/:id/payments',          SA_FN, ctrl.listPayments);
router.post  ('/housing/:id/payments',          SA_FN, ctrl.createPayment);
router.put   ('/housing/:id/payments/:pid',     SA_FN, ctrl.updatePayment);
router.delete('/housing/:id/payments/:pid',     SA,    ctrl.removePayment);

module.exports = router;
