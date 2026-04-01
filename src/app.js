'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const routes = require('./routes');
const { captureResponseBody, httpLogger } = require('./middlewares/http-logger.middleware');
const app = express();

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/$/, '');

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'https://maisa-primeris-fe.vercel.app',
  ]
    .filter(Boolean)
    .map(normalizeOrigin),
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);

  if (allowedOrigins.has(normalized)) return true;

  // support Vercel preview deployments
  return /^https:\/\/maisa-primeris-fe.*\.vercel\.app$/i.test(normalized);
};

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server calls / curl / postman (no origin)
    if (isAllowedOrigin(origin)) return callback(null, true);

    // do not throw error to avoid breaking requests unexpectedly
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
};

// ── Middleware ──────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(captureResponseBody);
app.use(httpLogger);
// Static uploads
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Id');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Maisa Primeris API is running' });
});

// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan', data: null });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
