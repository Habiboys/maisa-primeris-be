'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/material.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.listMaterials);
router.post('/', ctrl.createMaterial);
router.put('/:id', ctrl.updateMaterial);
router.delete('/:id', ctrl.deleteMaterial);

module.exports = router;
