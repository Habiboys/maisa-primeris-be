'use strict';

const router  = require('express').Router();
const ctrl    = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');
const Joi = require('joi');

const loginSchema = Joi.object({
  email   : Joi.string().email().required().messages({ 'string.email': 'Format email tidak valid' }),
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().min(8).required(),
});

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), ctrl.login);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, ctrl.logout);

// GET  /api/v1/auth/me
router.get('/me', authenticate, ctrl.me);

// PUT  /api/v1/auth/change-password
router.put('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword);

module.exports = router;
