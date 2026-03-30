'use strict';

const { Op } = require('sequelize');
const { sequelize, Lead, MarketingPerson, UnitStatus, User, HousingUnit } = require('../models');
const { LEAD_STATUS_VALUES } = require('../constants/leadStatuses');
const { withTenantWhere, requireCompanyId, isPlatformOwner } = require('../utils/tenant');

const assertLeadStatus = (status) => {
  if (status === undefined || status === null || status === '') return;
  if (!LEAD_STATUS_VALUES.includes(status)) {
    throw { message: `Status lead tidak valid. Nilai yang diizinkan: ${LEAD_STATUS_VALUES.join(', ')}`, status: 400 };
  }
};

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};
const mkPagination = (count, page, limit) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { page: parseInt(page, 10) || 1, limit: lim, total: count, total_pages: Math.ceil(count / lim) };
};

const buildDefaultUnitStatuses = (companyId) => {
  const rows = [];
  for (let i = 0; i < 40; i += 1) {
    const block = i < 20 ? 'A' : 'B';
    const num = String((i % 20) + 1).padStart(2, '0');
    rows.push({
      company_id: companyId,
      unit_code: `${block}-${num}`,
      project_id: null,
      status: 'Tersedia',
      consumer_id: null,
      price: 750000000,
      notes: null,
    });
  }
  return rows;
};

const ensureTenantUnitStatuses = async (actor) => {
  if (isPlatformOwner(actor) || !actor?.company_id) return;

  const count = await UnitStatus.count({ where: { company_id: actor.company_id } });
  if (count > 0) return;

  await UnitStatus.bulkCreate(buildDefaultUnitStatuses(actor.company_id));
};

module.exports = {
  // ── Leads ──────────────────────────────────────────────────────

  listLeads: async ({ search, status, source, marketing_id, project_id, unconverted_finance, page, limit } = {}, actor) => {
    const where = {};
    if (search)      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }, { interest: { [Op.like]: `%${search}%` } }];
    if (status) {
      assertLeadStatus(status);
      where.status = status;
    }
    if (source)      where.source      = source;
    if (marketing_id) where.marketing_id = marketing_id;

    const uf = unconverted_finance === true || unconverted_finance === '1' || unconverted_finance === 'true';
    if (uf) {
      where.status = 'Deal';
      where.consumer_id = null;
    }

    const marketingWhere = withTenantWhere({}, actor);
    const housingInclude = {
      model: HousingUnit,
      as: 'housingUnit',
      attributes: ['id', 'unit_code', 'unit_type', 'harga_jual', [sequelize.literal('`housingUnit->projectUnit`.`project_id`'), 'project_id']],
      required: false,
      include: []
    };
    if (project_id) {
      housingInclude.include.push({
        model: sequelize.models.ProjectUnit,
        as: 'projectUnit',
        attributes: [],
        where: withTenantWhere({ project_id }, actor),
      });
      housingInclude.required = true;
    } else {
      housingInclude.include.push({
        model: sequelize.models.ProjectUnit,
        as: 'projectUnit',
        attributes: [],
      });
    }

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'], where: marketingWhere, required: true },
        housingInclude,
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getLeadById: async (id, actor) => {
    const l = await Lead.findOne({
      where: { id },
      include: [
        { model: MarketingPerson, as: 'marketingPerson', attributes: ['id', 'name'], where: withTenantWhere({}, actor), required: true },
        { 
          model: HousingUnit, 
          as: 'housingUnit', 
          attributes: ['id', 'unit_code', 'unit_type', 'harga_jual', [sequelize.literal('`housingUnit->projectUnit`.`project_id`'), 'project_id']], 
          required: false,
          include: [{ model: sequelize.models.ProjectUnit, as: 'projectUnit', attributes: [] }]
        },
      ],
    });
    if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
    return l;
  },

  createLead: async (payload, actor) => {
    assertLeadStatus(payload.status);
    const t = await sequelize.transaction();
    try {
      const marketing = await MarketingPerson.findOne({
        where: withTenantWhere({ id: payload.marketing_id }, actor),
        transaction: t,
      });
      if (!marketing) throw { message: 'Marketing person tidak ditemukan untuk perusahaan ini', status: 404 };

      const housingUnitId = payload.housing_unit_id ?? null;
      if (housingUnitId) {
        const h = await HousingUnit.findOne({
          where: withTenantWhere({ id: housingUnitId }, actor),
          include: [{ model: sequelize.models.Lead, as: 'reservedLead' }],
          transaction: t,
        });
        if (!h) throw { message: 'Unit tidak ditemukan untuk perusahaan ini', status: 404 };

        // Booking/lock: hanya boleh ada 1 reserved_lead_id.
        if (h.reservedLead?.consumer_id) throw { message: 'Unit sudah terkonversi ke piutang/konsumen.', status: 400 };
        if (h.status === 'Sold') throw { message: 'Unit sudah Sold.', status: 400 };
        if (h.reserved_lead_id) throw { message: 'Unit sedang dikunci oleh lead lain.', status: 400 };
      }

      const { consumer_id, ...safe } = payload;
      const lead = await Lead.create(safe, { transaction: t });

      // Jika lead yang dibuat bukan Batal dan memilih unit, maka unit langsung menjadi Proses (terkunci).
      if (housingUnitId && safe.status !== 'Batal') {
        await HousingUnit.update(
          { reserved_lead_id: lead.id, status: 'Proses' },
          { where: withTenantWhere({ id: housingUnitId }, actor), transaction: t },
        );
      }

      await t.commit();
      return lead;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  updateLead: async (id, payload, actor) => {
    assertLeadStatus(payload.status);
    const t = await sequelize.transaction();
    try {
      const l = await Lead.findOne({
        where: { id },
        include: [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }],
        transaction: t,
      });
      if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };

      // Jika lead sudah dikonversi jadi consumer/pengajuan piutang,
      // kita tidak izinkan booking status/relasi unit diubah seenaknya.
      const hasConsumer = !!l.consumer_id;
      const nextStatus = payload.status ?? l.status;
      const nextHousingUnitId = payload.housing_unit_id !== undefined ? (payload.housing_unit_id ?? null) : l.housing_unit_id;

      if (payload.marketing_id) {
        const marketing = await MarketingPerson.findOne({
          where: withTenantWhere({ id: payload.marketing_id }, actor),
          transaction: t,
        });
        if (!marketing) throw { message: 'Marketing person tidak ditemukan untuk perusahaan ini', status: 404 };
      }

      if (hasConsumer) {
        if (nextStatus === 'Batal') {
          throw { message: 'Lead sudah dikonversi ke piutang, tidak bisa dibatalkan langsung.', status: 400 };
        }
        if (payload.housing_unit_id !== undefined && nextHousingUnitId !== l.housing_unit_id) {
          throw { message: 'Lead terkonversi: housing_unit tidak boleh diubah.', status: 400 };
        }
      }

      const oldHousingUnitId = l.housing_unit_id ?? null;

      const releaseUnit = async (unitId) => {
        if (!unitId) return;
        const unit = await HousingUnit.findOne({
          where: withTenantWhere({ id: unitId }, actor),
          include: [{ model: sequelize.models.Lead, as: 'reservedLead' }],
          transaction: t,
        });
        if (!unit) return;
        if (unit.reserved_lead_id !== l.id) return;
        if (unit.reservedLead?.consumer_id) throw { message: 'Tidak bisa release unit: masih terikat consumer.', status: 400 };
        await unit.update({ reserved_lead_id: null, status: 'Tersedia' }, { transaction: t });
      };

      const reserveUnit = async (unitId) => {
        if (!unitId) return;
        const unit = await HousingUnit.findOne({
          where: withTenantWhere({ id: unitId }, actor),
          include: [{ model: sequelize.models.Lead, as: 'reservedLead' }],
          transaction: t,
        });
        if (!unit) throw { message: 'Unit tidak ditemukan untuk perusahaan ini', status: 404 };
        if (unit.reservedLead?.consumer_id) throw { message: 'Unit sudah terkonversi ke piutang/konsumen.', status: 400 };
        if (unit.status === 'Sold') throw { message: 'Unit sudah Sold.', status: 400 };

        if (unit.reserved_lead_id && unit.reserved_lead_id !== l.id) {
          throw { message: 'Unit sedang dikunci oleh lead lain.', status: 400 };
        }

        await unit.update({ reserved_lead_id: l.id, status: 'Proses' }, { transaction: t });
      };

      // Release jika:
      // - menjadi Batal, atau
      // - menghapus housing_unit_id, atau
      // - pindah unit (switch).
      if (nextStatus === 'Batal') {
        await releaseUnit(oldHousingUnitId);
      } else if (nextHousingUnitId === null) {
        await releaseUnit(oldHousingUnitId);
      } else if (oldHousingUnitId && nextHousingUnitId && String(oldHousingUnitId) !== String(nextHousingUnitId)) {
        await releaseUnit(oldHousingUnitId);
        await reserveUnit(nextHousingUnitId);
      } else {
        // Same unit: reserve ulang bila sebelumnya batal atau reserved_lead_id hilang.
        if (oldHousingUnitId && nextHousingUnitId) {
          if (nextStatus !== 'Batal') {
            await reserveUnit(nextHousingUnitId);
          }
        } else if (nextHousingUnitId) {
          await reserveUnit(nextHousingUnitId);
        }
      }

      // Update lead data
      const { consumer_id, ...safe } = payload;
      await l.update(safe, { transaction: t });

      await t.commit();
      return l;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  removeLead: async (id, actor) => {
    const t = await sequelize.transaction();
    try {
      const l = await Lead.findOne({
        where: { id },
        include: [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }],
        transaction: t,
      });
      if (!l) throw { message: 'Lead tidak ditemukan', status: 404 };
      if (l.consumer_id) throw { message: 'Lead sudah terkonversi: tidak bisa dihapus.', status: 400 };

      if (l.housing_unit_id) {
        const unit = await HousingUnit.findOne({
          where: withTenantWhere({ id: l.housing_unit_id }, actor),
          include: [{ model: sequelize.models.Lead, as: 'reservedLead' }],
          transaction: t,
        });
        if (unit && unit.reserved_lead_id === l.id) {
          if (unit.reservedLead?.consumer_id) throw { message: 'Tidak bisa release: unit masih terikat consumer.', status: 400 };
          await unit.update({ reserved_lead_id: null, status: 'Tersedia' }, { transaction: t });
        }
      }

      await l.destroy({ transaction: t });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  getLeadStats: async (actor) => {
    const includeTenant = [{ model: MarketingPerson, as: 'marketingPerson', where: withTenantWhere({}, actor), required: true }];
    const [total, hot, deal, batal] = await Promise.all([
      Lead.count({ include: includeTenant }),
      Lead.count({ where: { status: 'Negoisasi' }, include: includeTenant }),
      Lead.count({ where: { status: 'Deal' }, include: includeTenant }),
      Lead.count({ where: { status: 'Batal' }, include: includeTenant }),
    ]);
    const closing_rate = total > 0 ? Math.round((deal / total) * 100) : 0;
    return { total, hot, closing_rate, batal };
  },

  // ── Marketing Persons ──────────────────────────────────────────

  listMarketingPersons: async ({ is_active, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;

    const { count, rows } = await MarketingPerson.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['name', 'ASC']],
      ...paginate(page, limit),
    });
    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  getMarketingPersonById: async (id, actor) => {
    const mp = await MarketingPerson.findOne({
      where: withTenantWhere({ id }, actor),
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    return mp;
  },

  createMarketingPerson: async (payload, actor) => MarketingPerson.create({ ...payload, company_id: requireCompanyId(actor) }),

  updateMarketingPerson: async (id, payload, actor) => {
    const mp = await MarketingPerson.findOne({ where: withTenantWhere({ id }, actor) });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.update(payload);
    return mp;
  },

  removeMarketingPerson: async (id, actor) => {
    const mp = await MarketingPerson.findOne({ where: withTenantWhere({ id }, actor) });
    if (!mp) throw { message: 'Marketing person tidak ditemukan', status: 404 };
    await mp.destroy();
  },

  // ── Unit Statuses (siteplan) ───────────────────────────────────

  listUnitStatuses: async (actor) => {
    await ensureTenantUnitStatuses(actor);
    return UnitStatus.findAll({ where: withTenantWhere({}, actor), order: [['unit_code', 'ASC']] });
  },

  updateUnitStatus: async (unitCode, payload, actor) => {
    const us = await UnitStatus.findOne({ where: withTenantWhere({ unit_code: unitCode }, actor) });
    if (!us) throw { message: 'Unit tidak ditemukan', status: 404 };
    await us.update(payload);
    return us;
  },
};
