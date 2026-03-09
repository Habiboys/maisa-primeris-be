'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/sop.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const SA    = authorize('Super Admin');
const SA_PM = authorize('Super Admin', 'Project Management');

router.use(authenticate);

// Permintaan Material
router.get   ('/material-requests',              SA_PM, ctrl.listPermintaan);
router.post  ('/material-requests',              SA_PM, ctrl.createPermintaan);
router.get   ('/material-requests/:id',          SA_PM, ctrl.getPermintaan);
router.patch ('/material-requests/:id/approve',  SA,    ctrl.approvePermintaan);
router.patch ('/material-requests/:id/reject',   SA,    ctrl.rejectPermintaan);
router.delete('/material-requests/:id',          SA,    ctrl.removePermintaan);

// Tanda Terima Gudang
router.get   ('/warehouse-receipts',             SA_PM, ctrl.listTTG);
router.post  ('/warehouse-receipts',             SA_PM, ctrl.createTTG);
router.patch ('/warehouse-receipts/:id/verify',  SA,    ctrl.verifyTTG);
router.delete('/warehouse-receipts/:id',         SA,    ctrl.removeTTG);

// Barang Keluar
router.get   ('/goods-out',              SA_PM, ctrl.listBarangKeluar);
router.post  ('/goods-out',              SA_PM, ctrl.createBarangKeluar);
router.delete('/goods-out/:id',          SA,    ctrl.removeBarangKeluar);

// Inventaris
router.get   ('/inventory',      SA_PM, ctrl.listInventaris);
router.post  ('/inventory',      SA_PM, ctrl.createInventaris);
router.get   ('/inventory/:id',  SA_PM, ctrl.getInventaris);
router.put   ('/inventory/:id',  SA_PM, ctrl.updateInventaris);
router.delete('/inventory/:id',  SA,    ctrl.removeInventaris);

// Surat Jalan
router.get   ('/delivery-orders',               SA_PM, ctrl.listSuratJalan);
router.post  ('/delivery-orders',               SA_PM, ctrl.createSuratJalan);
router.patch ('/delivery-orders/:id/status',    SA_PM, ctrl.updateSuratJalanStatus);
router.delete('/delivery-orders/:id',           SA,    ctrl.removeSuratJalan);

module.exports = router;
