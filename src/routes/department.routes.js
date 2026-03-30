'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/department.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.listDepartments);
router.post('/', ctrl.createDepartment);
router.put('/:id', ctrl.updateDepartment);
router.delete('/:id', ctrl.deleteDepartment);

module.exports = router;
