'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = require('express').Router();
const ctrl = require('../controllers/companySetting.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const uploadDir = path.join(__dirname, '../../uploads/company-branding');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({ storage });
const uploadBrandingFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
]);

const SA_OR_PLATFORM = authorize('Super Admin', 'Platform Owner');
const PLATFORM = authorize('Platform Owner');

const { ensureTenantContext } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use('/me', ensureTenantContext);  // /company-settings/me dan PUT /me butuh tenant context

router.get('/me', ctrl.me);
router.put('/me', SA_OR_PLATFORM, uploadBrandingFields, ctrl.updateMe);

router.get('/company/:companyId', PLATFORM, ctrl.getByCompanyId);
router.put('/company/:companyId', PLATFORM, uploadBrandingFields, ctrl.updateByCompanyId);

module.exports = router;
