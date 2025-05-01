// backend/routes/calendar.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { fetchTodayCalendar } = require('../services/calendarService');

// GET /api/calendar/today
router.get('/today', auth, async (req, res) => {
  try {
    const data = await fetchTodayCalendar(req.user);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
