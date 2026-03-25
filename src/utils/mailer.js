'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@primeris.local';
const APP_NAME = process.env.APP_NAME || 'Primeris One';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Kirim email reset password.
 * Jika SMTP tidak dikonfigurasi, log link ke console (development).
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = `Reset Password - ${APP_NAME}`;
  const html = `
    <p>Halo,</p>
    <p>Anda meminta reset password untuk akun <strong>${email}</strong>.</p>
    <p>Klik link berikut untuk mengatur ulang password (link berlaku 1 jam):</p>
    <p><a href="${resetUrl}" style="color:#b7860f;font-weight:bold">${resetUrl}</a></p>
    <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
    <p>— ${APP_NAME}</p>
  `;

  if (!process.env.SMTP_USER) {
    console.log('[Mailer] SMTP tidak dikonfigurasi. Reset link (dev):', resetUrl);
    return;
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error('[Mailer] Gagal kirim email:', err.message);
    throw { message: 'Gagal mengirim email. Coba lagi nanti.', status: 503 };
  }
}

module.exports = { sendPasswordResetEmail };
