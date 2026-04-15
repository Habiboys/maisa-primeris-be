'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Op } = require('sequelize');
const { MediaAsset } = require('../models');
const { withTenantWhere, requireCompanyId, isPlatformOwner } = require('../utils/tenant');
const {
  MAX_IMAGE_UPLOAD_BYTES,
  TARGET_COMPRESSED_BYTES,
  compressImageFileInPlace,
  isImageMime,
} = require('../utils/imageUpload');

const paginate = (page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return { limit: lim, offset: ((parseInt(page, 10) || 1) - 1) * lim };
};

const mkPagination = (count, page = 1, limit = 20) => {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  return {
    page: parseInt(page, 10) || 1,
    limit: lim,
    total: count,
    total_pages: Math.ceil(count / lim),
  };
};

const getImageMeta = async (filePath) => {
  try {
    const meta = await sharp(filePath).metadata();
    return {
      width: meta.width || null,
      height: meta.height || null,
    };
  } catch {
    return { width: null, height: null };
  }
};

const safeDeleteFile = (absolutePath) => {
  if (!absolutePath) return;
  if (!fs.existsSync(absolutePath)) return;
  try { fs.unlinkSync(absolutePath); } catch (_e) { /* noop */ }
};

module.exports = {
  list: async ({ search, category, page, limit } = {}, actor) => {
    const where = withTenantWhere({}, actor);
    if (search) {
      where[Op.or] = [
        { original_name: { [Op.like]: `%${search}%` } },
        { stored_name: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;

    const { count, rows } = await MediaAsset.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
    });

    return { data: rows, pagination: mkPagination(count, page, limit) };
  },

  upload: async ({ file, category }, actor) => {
    if (!file) throw { message: 'File wajib diupload', status: 400 };

    const absolute = file.path;
    if (isImageMime(file.mimetype) && Number(file.size || 0) > MAX_IMAGE_UPLOAD_BYTES) {
      safeDeleteFile(absolute);
      throw { message: 'Ukuran gambar maksimal 2MB', status: 400 };
    }

    if (isImageMime(file.mimetype)) {
      const compressed = await compressImageFileInPlace(absolute, file.mimetype, {
        maxBytes: TARGET_COMPRESSED_BYTES,
      });
      file.size = compressed.bytes;
      file.mimetype = compressed.mime;
    }

    const { width, height } = await getImageMeta(absolute);
    const companyId = isPlatformOwner(actor) ? (actor?.company_id || null) : requireCompanyId(actor);

    const row = await MediaAsset.create({
      company_id: companyId,
      uploaded_by: actor?.id || null,
      category: category || 'general',
      original_name: file.originalname || null,
      stored_name: file.filename,
      mime_type: file.mimetype,
      size_bytes: Number(file.size || 0),
      width,
      height,
      file_path: `/uploads/media/${file.filename}`,
    });

    return row;
  },

  remove: async (id, actor) => {
    const row = await MediaAsset.findOne({ where: withTenantWhere({ id }, actor) });
    if (!row) throw { message: 'Media tidak ditemukan', status: 404 };

    const absolute = path.join(__dirname, '../..', row.file_path);
    safeDeleteFile(absolute);
    await row.destroy();
  },
};
