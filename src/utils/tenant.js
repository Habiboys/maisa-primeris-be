'use strict';

const isPlatformOwner = (actor) => actor?.role === 'Platform Owner';

const requireCompanyId = (actor) => {
  if (isPlatformOwner(actor)) return actor?.company_id || null;
  if (!actor?.company_id) throw { message: 'User belum terikat perusahaan', status: 403 };
  return actor.company_id;
};

const withTenantWhere = (baseWhere = {}, actor, field = 'company_id') => {
  if (isPlatformOwner(actor) && !actor?.company_id) return { ...baseWhere };
  const companyId = requireCompanyId(actor);
  return { ...baseWhere, [field]: companyId };
};

// Agar keamanan multi-tenant terjaga:
// - jangan izinkan client mengubah company_id lewat payload update.
const stripCompanyId = (payload = {}) => {
  if (!payload || typeof payload !== 'object') return payload;
  // support variasi penamaan yang mungkin dari frontend
  const { company_id, companyId, ...rest } = payload;
  return rest;
};

module.exports = {
  isPlatformOwner,
  requireCompanyId,
  withTenantWhere,
  stripCompanyId,
};
