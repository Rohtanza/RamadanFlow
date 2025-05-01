const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PrayerSetting = require('../models/PrayerSetting');
const { fetchPrayerTimes } = require('../services/prayerService');

// @route   GET /api/prayer/settings
// @desc    Get current user’s prayer settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  const setting = await PrayerSetting.findOne({ user: req.user });
  if (!setting) return res.json(null);
  res.json(setting);
});

// @route   POST /api/prayer/settings
// @desc    Create or update prayer settings
// @access  Private
router.post('/settings', auth, async (req, res) => {
  const { latitude, longitude, method } = req.body;
  let setting = await PrayerSetting.findOne({ user: req.user });
  if (setting) {
    setting.latitude = latitude;
    setting.longitude = longitude;
    setting.method = method || setting.method;
    setting.updatedAt = Date.now();
  } else {
    setting = new PrayerSetting({
      user: req.user,
      latitude,
      longitude,
      method
    });
  }
  await setting.save();
  res.json(setting);
});

// @route   GET /api/prayer/today
// @desc    Fetch today’s prayer times based on saved settings
// @access  Private
router.get('/today', auth, async (req, res) => {
  const setting = await PrayerSetting.findOne({ user: req.user });
  if (!setting) 
    return res.status(400).json({ msg: 'No prayer settings found' });

  try {
    const times = await fetchPrayerTimes(
      setting.latitude,
      setting.longitude
    );
    res.json(times);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch prayer times' });
  }
});

module.exports = router;
