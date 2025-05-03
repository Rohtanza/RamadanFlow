const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PrayerLog = require('../models/PrayerLog');

// @route   POST /api/salah/log
// @desc    Log a prayer as completed
// @body    { prayer: string, date: YYYY-MM-DD }
// @access  Private
router.post('/log', auth, async (req, res) => {
  const { prayer, date } = req.body;
  try {
    const logDate = new Date(date);
    const log = new PrayerLog({ user: req.user, prayer, date: logDate });
    await log.save();
    res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Already logged today' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/salah/log
// @desc    Remove today's prayer log (uncheck)
// @body    { prayer: string, date: YYYY-MM-DD }
// @access  Private
router.delete('/log', auth, async (req, res) => {
  const { prayer, date } = req.body;
  try {
    const logDate = new Date(date);
    await PrayerLog.findOneAndDelete({ user: req.user, prayer, date: logDate });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/salah/logs
// @desc    Get all prayer logs in a date range
// @query   start=YYYY-MM-DD, end=YYYY-MM-DD
// @access  Private
router.get('/logs', auth, async (req, res) => {
  const { start, end } = req.query;
  const s = new Date(start);
  const e = new Date(end);
  try {
    const logs = await PrayerLog.find({
      user: req.user,
      date: { $gte: s, $lte: e }
    }).select('prayer date -_id');
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/salah/stats
// @desc    Get completion count per day for last N days
// @query   days=7  (default 7 for weekly, 30 for monthly)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  try {
    const agg = await PrayerLog.aggregate([
      { $match: { user: req.user, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0,10);
      const found = agg.find(x => x._id === key);
      result.push({ date: key, completed: found ? found.count : 0 });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
