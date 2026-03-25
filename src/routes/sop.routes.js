'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/sop.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ensureTenantContext } = require('../middlewares/tenant.middleware');

const SA    = authorize('Super Admin');
const SA_PM = authorize('Super Admin', 'Project Management');

router.use(authenticate, ensureTenantContext);

// Permintaan Material
router.get   ('/material-requests',              SA_PM, ctrl.listPermintaan);
router.post  ('/material-requests',              SA_PM, ctrl.createPermintaan);
router.get   ('/material-requests/:id',          SA_PM, ctrl.getPermintaan);
router.patch ('/material-requests/:id/approve',  SA,    ctrl.approvePermintaan);
router.patch ('/material-requests/:id/reject',   SA,    ctrl.rejectPermintaan);
router.delete('/material-requests/:id',          SA,    ctrl.removePermintaan);
router.post  ('/sop/preview/permintaan',         SA_PM, ctrl.previewPermintaan);
router.post  ('/sop/pdf/permintaan',             SA_PM, ctrl.pdfPermintaan);

// Tanda Terima Gudang
router.get   ('/warehouse-receipts',             SA_PM, ctrl.listTTG);
router.post  ('/warehouse-receipts',             SA_PM, ctrl.createTTG);
router.get   ('/warehouse-receipts/:id/pdf',     SA_PM, ctrl.pdfTTGById);
router.patch ('/warehouse-receipts/:id/verify',  SA,    ctrl.verifyTTG);
router.delete('/warehouse-receipts/:id',         SA,    ctrl.removeTTG);
router.post  ('/sop/preview/ttg',                SA_PM, ctrl.previewTTG);
router.post  ('/sop/pdf/ttg',                    SA_PM, ctrl.pdfTTG);

// Barang Keluar
router.get   ('/goods-out',              SA_PM, ctrl.listBarangKeluar);
router.post  ('/goods-out',              SA_PM, ctrl.createBarangKeluar);
router.get   ('/goods-out/:id/pdf',       SA_PM, ctrl.pdfBarangKeluarById);
router.delete('/goods-out/:id',          SA,    ctrl.removeBarangKeluar);
router.post  ('/sop/preview/barang-keluar', SA_PM, ctrl.previewBarangKeluar);
router.post  ('/sop/pdf/barang-keluar',     SA_PM, ctrl.pdfBarangKeluar);

// Inventaris
router.get   ('/inventory',      SA_PM, ctrl.listInventaris);
router.post  ('/inventory',      SA_PM, ctrl.createInventaris);
router.get   ('/inventory/:id',  SA_PM, ctrl.getInventaris);
router.get   ('/inventory/:id/pdf', SA_PM, ctrl.pdfInventarisById);
router.put   ('/inventory/:id',  SA_PM, ctrl.updateInventaris);
router.delete('/inventory/:id',  SA,    ctrl.removeInventaris);
router.post  ('/sop/preview/inventaris', SA_PM, ctrl.previewInventaris);
router.post  ('/sop/pdf/inventaris',     SA_PM, ctrl.pdfInventaris);

// Surat Jalan
router.get   ('/delivery-orders',               SA_PM, ctrl.listSuratJalan);
router.post  ('/delivery-orders',               SA_PM, ctrl.createSuratJalan);
router.get   ('/delivery-orders/:id/pdf',       SA_PM, ctrl.pdfSuratJalanById);
router.patch ('/delivery-orders/:id/status',    SA_PM, ctrl.updateSuratJalanStatus);
router.delete('/delivery-orders/:id',           SA,    ctrl.removeSuratJalan);
router.post  ('/sop/preview/surat-jalan',       SA_PM, ctrl.previewSuratJalan);
router.post  ('/sop/pdf/surat-jalan',           SA_PM, ctrl.pdfSuratJalan);

module.exports = router;
