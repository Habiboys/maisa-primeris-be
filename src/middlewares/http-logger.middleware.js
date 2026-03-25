'use strict';

const morgan = require('morgan');

function maskSensitive(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (typeof value !== 'object') return value;

  const SENSITIVE_KEYS = ['password', 'token', 'access_token', 'refresh_token', 'authorization', 'secret'];
  const masked = {};

  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.includes(String(key).toLowerCase())) {
      masked[key] = '[REDACTED]';
      continue;
    }
    masked[key] = maskSensitive(val);
  }

  return masked;
}

function stringifyForLog(payload) {
  if (payload === undefined) return '-';

  const safePayload = maskSensitive(payload);
  const text = typeof safePayload === 'string' ? safePayload : JSON.stringify(safePayload);
  const maxLength = 1000;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...[truncated]` : text;
}

function captureResponseBody(req, res, next) {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    res.locals.responseBody = body;
    return originalJson(body);
  };

  res.send = (body) => {
    res.locals.responseBody = body;
    return originalSend(body);
  };

  next();
}

morgan.token('req-body', (req) => stringifyForLog(req.body));
morgan.token('res-body', (_req, res) => stringifyForLog(res.locals.responseBody));
morgan.token('req-id', (req) => req.headers['x-request-id'] || '-');

function isTruthyEnv(value) {
  return ['true', '1', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

const httpLogger = morgan((tokens, req, res) => {
  const base = `${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens['response-time'](req, res)} ms - ${tokens.res(req, res, 'content-length')} reqId=${tokens['req-id'](req, res)}`;

  if (!isTruthyEnv(process.env.LOG_HTTP_BODY)) {
    return base;
  }

  const reqBody = tokens['req-body'](req, res);
  const resBody = tokens['res-body'](req, res);
  return `${base} req=${reqBody} res=${resBody}`;
});

module.exports = {
  captureResponseBody,
  httpLogger,
};
