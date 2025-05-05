// utils/mail.js
import nodemailer from 'nodemailer';

export function sendResetEmail(to, link) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: `"Noor Al-Iman” <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <p>Click <a href="${link}">here</a> to reset your password.</p>
      <p>This link expires in 1 hour.</p>
    `
  });
}
