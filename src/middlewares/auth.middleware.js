'use strict';

const jwt    = require('jsonwebtoken');
const { User } = require('../models');
const res_   = require('../utils/response');

/**
 * Verifies the JWT Bearer token and attaches req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers['authorization'] || '';
    if (!header.startsWith('Bearer ')) {
      return res_.unauthorized(res, 'Token tidak ditemukan');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'work_location_id'],
    });

    if (!user || user.status !== 'Aktif') {
      return res_.unauthorized(res, 'Akun tidak aktif atau tidak ditemukan');
    }

    req.user = user;
    next();
  } catch (err) {
    return res_.unauthorized(res, 'Token tidak valid atau sudah kadaluarsa');
  }
};

/**
 * Role-based access guard.
 * Usage: authorize('Admin', 'Manajer')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res_.forbidden(res, 'Anda tidak memiliki akses ke resource ini');
  }
  next();
};

module.exports = { authenticate, authorize };
