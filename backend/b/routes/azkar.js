const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMorningAzkar,
  getEveningAzkar,
  getPostPrayerAzkar
} = require('../services/azkarService');

// GET /api/azkar/morning
router.get('/morning', auth, (req, res) => {
  try {
    const data = getMorningAzkar();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to load Morning Azkar' });
  }
});

// GET /api/azkar/evening
router.get('/evening', auth, (req, res) => {
  try {
    const data = getEveningAzkar();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to load Evening Azkar' });
  }
});

// GET /api/azkar/post-prayer
router.get('/post-prayer', auth, (req, res) => {
  try {
    const data = getPostPrayerAzkar();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to load Post-Prayer Azkar' });
  }
});

module.exports = router;
