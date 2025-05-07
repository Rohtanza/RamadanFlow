const axios = require('axios');
module.exports = async function (req, res, next) {
  const token = req.body.captcha;
  if (!token) return res.status(400).json({ errors:[{ msg:'Captcha required' }] });

  try {
    const secret = process.env.RECAPTCHA_SECRET;
    const resp = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      new URLSearchParams({ secret, response: token }).toString(),
      { headers: {'Content-Type':'application/x-www-form-urlencoded'} }
    );
    if (!resp.data.success) {
      return res.status(400).json({ errors:[{ msg:'Captcha validation failed' }] });
    }
    next();
  } catch (err) {
    console.error('reCAPTCHA error', err);
    res.status(500).send('Captcha verification error');
  }
};
