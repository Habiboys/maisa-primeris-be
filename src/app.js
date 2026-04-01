'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const routes = require('./routes');
const { captureResponseBody, httpLogger } = require('./middlewares/http-logger.middleware');
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://maisa-primeris-fe.vercel.app',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server calls / curl / postman (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
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
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
