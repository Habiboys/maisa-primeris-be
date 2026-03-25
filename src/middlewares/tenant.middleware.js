'use strict';

const res_ = require('../utils/response');

/**
 * Wajib dipasang SETELAH authenticate pada route yang mengakses data tenant.
 * Memastikan:
 * - req.tenantCompanyId di-set dari req.user.company_id.
 * - User tenant (bukan Platform Owner) wajib punya company_id; bila tidak, 403.
 * (req.user sudah dinormalisasi di auth.middleware jadi plain object.)
 */
const ensureTenantContext = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res_.unauthorized(res, 'Token tidak ditemukan');
  }

  const companyId = user.company_id ?? null;
  const isPlatformOwner = user.role === 'Platform Owner';

  if (!isPlatformOwner && (companyId === null || companyId === undefined)) {
    return res_.forbidden(res, 'User belum terikat perusahaan. Tidak dapat mengakses data.');
  }

  req.tenantCompanyId = isPlatformOwner ? (companyId || null) : companyId;
  next();
};

module.exports = { ensureTenantContext };
