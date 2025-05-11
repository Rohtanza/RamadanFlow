const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PrayerLog = require('../models/PrayerLog');
const { fetchPrayerTimes } = require('../services/prayerService');
const { formatDate } = require('../utils/dateUtils');

const VALID_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// @route   POST /api/prayer/times
// @desc    Get prayer times for coordinates
// @access  Private
router.post('/times', auth, async (req, res) => {
  try {
    const { latitude, longitude, method } = req.body;
    
    // Basic validation
    if (!latitude || !longitude || !method) {
      return res.status(400).json({ msg: 'Missing required parameters' });
    }

    // Get prayer times
    const times = await fetchPrayerTimes(latitude, longitude, method);

    // Get completed prayers for today
    const today = formatDate(new Date());
    const completed = await PrayerLog.find({
      user: req.user.id,
      date: today
    }).select('prayer -_id');

    return res.json({
      ...times,
      completed: completed.map(log => log.prayer)
    });
  } catch (error) {
    console.error('Error getting prayer times:', error);
    res.status(500).json({ msg: error.message || 'Server error' });
  }
});

// @route   POST /api/prayer/log
// @desc    Toggle prayer completion status
// @access  Private
router.post('/log', auth, async (req, res) => {
  try {
    const { prayer, date } = req.body;
    
    // Validate prayer name
    if (!VALID_PRAYERS.includes(prayer?.toLowerCase())) {
      return res.status(400).json({ msg: 'Invalid prayer name' });
    }

    // Find existing log
    const existingLog = await PrayerLog.findOne({
      user: req.user.id,
      prayer: prayer.toLowerCase(),
      date
    });

    if (existingLog) {
      // If log exists, delete it
      await PrayerLog.deleteOne({ _id: existingLog._id });
    } else {
      // If no log exists, create one
      await PrayerLog.create({
        user: req.user.id,
        prayer: prayer.toLowerCase(),
        date
      });
    }

    // Get updated completed prayers
    const completed = await PrayerLog.find({
      user: req.user.id,
      date
    }).select('prayer -_id');

    return res.json({
      completed: completed.map(log => log.prayer)
    });
  } catch (error) {
    console.error('Error toggling prayer:', error);
    res.status(500).json({ msg: error.message || 'Server error' });
  }
});

// @route   GET /api/prayer/stats
// @desc    Get prayer completion stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = [];
    
    // Get stats for each day
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = formatDate(date);
      
      // Get all prayers for this day
      const prayers = await PrayerLog.find({
        user: req.user.id,
        date: formattedDate
      }).select('prayer -_id');

      // Get completed prayers
      const completedPrayers = prayers.map(p => p.prayer);

      // Create prayer details
      const details = VALID_PRAYERS.map(prayer => ({
        name: prayer,
        completed: completedPrayers.includes(prayer)
      }));

      stats.unshift({
        date: formattedDate,
        completed: completedPrayers.length,
        details,
        prayers: completedPrayers
      });
    }

    return res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ msg: error.message || 'Server error' });
  }
});

module.exports = router;
