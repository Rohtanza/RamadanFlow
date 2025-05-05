// If you want real SMS, install twilio: npm install twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

/**
 * Send a welcome SMS
 * @param {string} to      - recipient phone number in E.164 format
 * @param {string} message - SMS body
 */
async function sendWelcomeSMS(to, message) {
  const msg = await client.messages.create({
    from: process.env.TWILIO_FROM,
    to,
    body: message
  });
  console.log('📱 SMS sent:', msg.sid);
}

module.exports = { sendWelcomeSMS };
