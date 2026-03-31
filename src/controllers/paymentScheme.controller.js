'use strict';
const db = require('../models');
const { success, created, error } = require('../utils/response');
const PaymentScheme = db.PaymentScheme;

module.exports = {
  listPaymentSchemes: async (req, res) => {
    try {
      const { company_id } = req.user;
      const data = await PaymentScheme.findAll({
        where: { company_id },
        order: [['name', 'ASC']]
      });
      return success(res, data, 'Daftar Skema Pembayaran');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  createPaymentScheme: async (req, res) => {
    try {
      const { company_id } = req.user;
      const { name, description } = req.body;
      if (!name) return error(res, 'Nama skema pembayaran harus diisi', 400);

      const data = await PaymentScheme.create({ company_id, name, description });
      return created(res, data, 'Skema pembayaran berhasil ditambahkan');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  updatePaymentScheme: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;
      const { name, description } = req.body;

      const curr = await PaymentScheme.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      if (name) curr.name = name;
      if (description !== undefined) curr.description = description;

      await curr.save();
      return success(res, curr, 'Skema pembayaran berhasil diperbarui');
    } catch (e) {
      return error(res, e.message, 500);
    }
  },

  deletePaymentScheme: async (req, res) => {
    try {
      const { id } = req.params;
      const { company_id } = req.user;
      
      const curr = await PaymentScheme.findOne({ where: { id, company_id } });
      if (!curr) return error(res, 'Data tidak ditemukan', 404);

      await curr.destroy();
      return success(res, null, 'Skema pembayaran berhasil dihapus');
    } catch (e) {
      return error(res, e.message, 500);
    }
  }
};
