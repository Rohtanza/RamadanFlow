// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:    +process.env.SMTP_PORT,
  secure:   process.env.SMTP_SECURE === 'true',
  auth: {
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS
  }
});

// verify on startup
transporter
.verify()
.then(() => console.log('✅ SMTP transporter ready'))
.catch(err => console.error('❌ SMTP transporter error:', err));

async function sendResetEmail(to, link) {
  return transporter.sendMail({
    from: `"Noor Al-Iman" <${process.env.SMTP_USER}@sandbox.smtp.mailtrap.io>`,
    to,
    subject: '🔒 Password Reset Request',
    html: `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
    <h2>Password Reset</h2>
    <p>You requested a password reset for your Noor Al-Iman account.</p>
    <p><a href="${link}" style="background: #facc15; color: #000; padding: 8px 12px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
    <p style="font-size: 0.9em; color: #666;">This link expires in one hour.</p>
    </div>
    `
  });
}

async function sendWelcomeEmail(to, name) {
  return transporter.sendMail({
    from: `"Noor Al-Iman" <${process.env.SMTP_USER}@sandbox.smtp.mailtrap.io>`,
    to,
    subject: '🎉 Welcome to Noor Al-Iman',
    html: `
    <div style="font-family: sans-serif; color: #333;">
    <h2>Welcome, ${name}!</h2>
    <p>Thanks for registering at Noor Al-Iman. We’re excited to have you on board.</p>
    <p>— The Noor Al-Iman Team</p>
    </div>
    `
  });
}

module.exports = {
  sendResetEmail,
  sendWelcomeEmail   // ← export it here
};
