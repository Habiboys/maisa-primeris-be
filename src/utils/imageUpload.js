'use strict';

const fs = require('fs');
const sharp = require('sharp');

const fsp = fs.promises;

const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
const TARGET_COMPRESSED_BYTES = 500 * 1024; // 500 KB

const isCompressibleImageMime = (mime = '') => /^image\/(jpeg|jpg|png|webp)$/i.test(String(mime));
const isImageMime = (mime = '') => /^image\//i.test(String(mime));

const collectMulterFiles = (req) => {
  const result = [];
  if (Array.isArray(req.files)) result.push(...req.files);
  else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((entry) => {
      if (Array.isArray(entry)) result.push(...entry);
    });
  }
  if (req.file) result.push(req.file);
  return result;
};

const extByMime = (mime = '') => {
  const lower = String(mime).toLowerCase();
  if (lower === 'image/png') return 'png';
  if (lower === 'image/webp') return 'webp';
  return 'jpg';
};

const compressImageBuffer = async (
  inputBuffer,
  mime,
  { maxBytes = TARGET_COMPRESSED_BYTES, maxWidth = 1920 } = {},
) => {
  const meta = await sharp(inputBuffer).metadata();
  const initialWidth = Math.min(meta.width || maxWidth, maxWidth);

  let width = initialWidth;
  let best = inputBuffer;
  let bestMime = mime;

  for (let widthStep = 0; widthStep < 7; widthStep += 1) {
    for (let quality = 84; quality >= 40; quality -= 8) {
      let pipeline = sharp(inputBuffer).rotate();
      if (width > 0) {
        pipeline = pipeline.resize({ width: Math.max(360, Math.round(width)), withoutEnlargement: true });
      }

      let nextMime = mime;
      if (/image\/png/i.test(mime)) {
        pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true, effort: 8 });
        nextMime = 'image/png';
      } else if (/image\/webp/i.test(mime)) {
        pipeline = pipeline.webp({ quality, effort: 6 });
        nextMime = 'image/webp';
      } else {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
        nextMime = 'image/jpeg';
      }

      const candidate = await pipeline.toBuffer();
      if (candidate.length < best.length) {
        best = candidate;
        bestMime = nextMime;
      }
      if (candidate.length <= maxBytes) {
        return { buffer: candidate, mime: nextMime, bytes: candidate.length };
      }
    }

    width = Math.max(360, Math.round(width * 0.85));
  }

  return { buffer: best, mime: bestMime, bytes: best.length };
};

const compressImageFileInPlace = async (
  filePath,
  mime,
  { maxBytes = TARGET_COMPRESSED_BYTES } = {},
) => {
  const original = await fsp.readFile(filePath);
  const output = await compressImageBuffer(original, mime, { maxBytes });

  if (output.buffer.length >= original.length) {
    return { bytes: original.length, mime };
  }

  await fsp.writeFile(filePath, output.buffer);
  return { bytes: output.bytes, mime: output.mime };
};

const parseDataUrlImage = (value) => {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
  if (!m) return null;
  return {
    mime: m[1].toLowerCase(),
    buffer: Buffer.from(m[2], 'base64'),
  };
};

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  TARGET_COMPRESSED_BYTES,
  collectMulterFiles,
  compressImageBuffer,
  compressImageFileInPlace,
  extByMime,
  isCompressibleImageMime,
  isImageMime,
  parseDataUrlImage,
};
