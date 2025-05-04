const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PrayerSetting = require('../models/PrayerSetting');
const { fetchPrayerTimes } = require('../services/prayerService');
const requestIp = require('request-ip'); 
const axios = require('axios');


router.get('/settings', auth, async (req, res) => {
  const setting = await PrayerSetting.findOne({ user: req.user });
  res.json(setting || null);
});

router.post('/settings', auth, async (req, res) => {
  const { method } = req.body;
  let setting = await PrayerSetting.findOne({ user: req.user });
  if (setting) {
    setting.method = method || setting.method;
    setting.updatedAt = Date.now();
  } else {
    setting = new PrayerSetting({
      user: req.user,
      method
    });
  }
  await setting.save();
  res.json(setting);
});

router.get('/today',auth, async (req, res) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const ip = '8.8.8.8';

    const ipResponse = await axios.get(`https://ipwho.is/${ip}`);
    const { city, success } = ipResponse.data;
    console.log("📍 IP Info:", ipResponse.data);
    console.log("📍 City:", city);
    if (!success) {
      return res.status(500).json({ msg: 'Failed to get location from IP' });
    }

    const times = await fetchPrayerTimes(city);
    res.json({ ...times, city });
  } catch (err) {
    console.error("ERROR in /today route:", err); 
    res.status(500).json({ msg: 'Failed to fetch prayer times' });
  }
});




module.exports = router;
