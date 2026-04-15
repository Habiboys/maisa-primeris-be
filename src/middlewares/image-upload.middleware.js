'use strict';

const {
  MAX_IMAGE_UPLOAD_BYTES,
  TARGET_COMPRESSED_BYTES,
  collectMulterFiles,
  compressImageFileInPlace,
  isCompressibleImageMime,
  isImageMime,
} = require('../utils/imageUpload');

const enforceAndCompressUploadedImages = ({
  maxOriginalBytes = MAX_IMAGE_UPLOAD_BYTES,
  maxCompressedBytes = TARGET_COMPRESSED_BYTES,
} = {}) => async (req, res, next) => {
  try {
    const files = collectMulterFiles(req);

    for (const file of files) {
      if (!isImageMime(file?.mimetype)) continue;

      if (Number(file.size || 0) > maxOriginalBytes) {
        return res.status(400).json({
          success: false,
          message: 'Ukuran gambar melebihi batas',
          error: `Maksimal ukuran gambar adalah ${Math.round(maxOriginalBytes / 1024 / 1024)}MB`,
        });
      }

      if (!isCompressibleImageMime(file.mimetype)) continue;

      const compressed = await compressImageFileInPlace(file.path, file.mimetype, { maxBytes: maxCompressedBytes });
      file.size = compressed.bytes;
      file.mimetype = compressed.mime;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { enforceAndCompressUploadedImages };
