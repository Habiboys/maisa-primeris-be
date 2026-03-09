'use strict';

/**
 * Standardised JSON response helpers
 */

const success = (res, data = null, message = 'Berhasil', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = null, message = 'Data berhasil dibuat') =>
  success(res, data, message, 201);

const error = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = 'Data tidak ditemukan') =>
  error(res, message, 404);

const unauthorized = (res, message = 'Tidak diotorisasi') =>
  error(res, message, 401);

const forbidden = (res, message = 'Akses ditolak') =>
  error(res, message, 403);

const badRequest = (res, message = 'Permintaan tidak valid', errors = null) =>
  error(res, message, 400, errors);

module.exports = { success, created, error, notFound, unauthorized, forbidden, badRequest };
