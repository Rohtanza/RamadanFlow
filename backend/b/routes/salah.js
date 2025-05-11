// backend/routes/salah.js

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PrayerLog = require('../models/PrayerLog');
const ActivityLog = require('../models/ActivityLog');

const VALID_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Helper function to validate date
const validateDate = (dateStr) => {
  try {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    const checkDate = new Date(dateStr);
    if (!(checkDate instanceof Date) || isNaN(checkDate)) {
      return false;
    }
    
    // Set both dates to start of day for comparison
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Compare dates - must not be in the future
    return checkDate <= today;
  } catch (error) {
    console.error('Date validation error:', error);
    return false;
  }
};

// Helper function to normalize date
function normalizeDate(dateString) {
  const date = new Date(dateString);
  // Set to start of day to avoid timezone issues
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper function to validate date range
function validateDateRange(start, end) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  // Cap future dates to today
  if (startDate > today) startDate.setTime(today.getTime());
  if (endDate > today) endDate.setTime(today.getTime());
  
  // Ensure start is not after end
  if (startDate > endDate) {
    const temp = startDate.getTime();
    startDate.setTime(endDate.getTime());
    endDate.setTime(temp);
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

// @route   POST /api/salah/log
// @desc    Log a prayer as completed
// @body    { prayer: string, date: YYYY-MM-DD }
router.post('/log', auth, async (req, res) => {
  const { prayer, date } = req.body;
  
  try {
    // Validate prayer name
    if (!VALID_PRAYERS.includes(prayer?.toLowerCase())) {
      return res.status(400).json({ msg: 'Invalid prayer name' });
    }

    // Validate date
    if (!date || !validateDate(date)) {
      return res.status(400).json({ msg: 'Invalid or future date' });
    }

    // Check if prayer is already logged
    let log = await PrayerLog.findOne({
      user: req.user.id,
      prayer: prayer.toLowerCase(),
      date
    });

    if (log) {
      return res.status(400).json({ msg: 'Prayer already logged' });
    }

    // Create new prayer log
    log = new PrayerLog({
      user: req.user.id,
      prayer: prayer.toLowerCase(),
      date
    });

    await log.save();
    res.json(log);
  } catch (error) {
    console.error('Error in POST /api/salah/log:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/salah/log
// @desc    Remove prayer log (uncheck)
// @query   prayer=string&date=YYYY-MM-DD
// @body    { prayer: string, date: YYYY-MM-DD }
// @access  Private
router.delete('/log', auth, async (req, res) => {
  // Try to get parameters from query first, then body
  const prayer = req.query.prayer || req.body.prayer;
  const date = req.query.date || req.body.date;
  
  try {
    // Log request details for debugging
    console.log('DELETE request details:', {
      query: req.query,
      body: req.body,
      prayer,
      date,
      user: req.user.id
    });

    // Validate prayer name
    if (!VALID_PRAYERS.includes(prayer?.toLowerCase())) {
      return res.status(400).json({ msg: 'Invalid prayer name' });
    }

    // Validate date
    if (!date || !validateDate(date)) {
      return res.status(400).json({ msg: 'Invalid or future date' });
    }

    // Find and remove the prayer log
    const log = await PrayerLog.findOne({
      user: req.user.id,
      prayer: prayer.toLowerCase(),
      date
    });

    if (!log) {
      return res.status(404).json({ msg: 'Prayer log not found' });
    }

    await log.remove();
    res.json({ msg: 'Prayer log removed' });
  } catch (error) {
    console.error('Error in DELETE /api/salah/log:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/salah/logs
// @desc    Get all prayer logs in a date range
// @query   start=YYYY-MM-DD, end=YYYY-MM-DD
// @access  Private
router.get('/logs', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    
    if (!validateDate(start) || !validateDate(end)) {
      return res.status(400).json({ error: 'Invalid date format or future date' });
    }
    
    const { start: validStart, end: validEnd } = validateDateRange(start, end);
    
    const logs = await PrayerLog.find({
      user: req.user.id,
      date: {
        $gte: validStart,
        $lte: validEnd
      }
    }).sort({ date: 1 });
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching prayer logs:', error);
    res.status(500).json({ error: 'Failed to fetch prayer logs' });
  }
});

// @route   GET /api/salah/stats
// @desc    Get completion count and prayers per day for last N days
// @query   days=7  (default 7 for weekly, 30 for monthly)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    
    const logs = await PrayerLog.find({
      user: req.user.id,
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0]
      }
    }).sort({ date: 1 });
    
    const stats = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.toISOString().split('T')[0] === dateStr;
      });
      
      stats.push({
        date: dateStr,
        completed: dayLogs.length,
        prayers: dayLogs.map(log => log.prayer),
        details: VALID_PRAYERS.map(prayer => ({
          name: prayer,
          completed: dayLogs.some(log => log.prayer === prayer)
        }))
      });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching prayer stats:', error);
    res.status(500).json({ error: 'Failed to fetch prayer stats' });
  }
});

module.exports = router;
