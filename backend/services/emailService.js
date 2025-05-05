const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     parseInt(process.env.SMTP_PORT),
  secure:   process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send a simple welcome email
 * @param {string} to   - recipient email
 * @param {string} name - user’s name for personalization
 */
async function sendWelcomeEmail(to, name) {
  const info = await transporter.sendMail({
    from:    `"Noor Al-Iman" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Welcome to Noor Al-Iman',
    html:    `<p>As­salaamu Alaikum <strong>${name}</strong>,</p>
              <p>Thank you for registering at Noor Al-Iman. We’re honored to have you on board!</p>
              <p>— The Noor Al-Iman Team</p>`
  });
  console.log('📧 Welcome email sent:', info.messageId);
}

module.exports = { sendWelcomeEmail };
