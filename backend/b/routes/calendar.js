// backend/routes/calendar.js
const express = require('express');
const router  = express.Router();
const { fetchTodayCalendar } = require('../services/calendarService');

// GET /api/calendar/today
router.get('/today', async (req, res) => {
  try {
    // Pass null as userId to indicate no authentication
    const data = await fetchTodayCalendar(null);
    res.json(data);
  } catch (err) {
    console.error('Calendar API Error:', {
      error: err.message,
      stack: err.stack
    });
    
    // Send more specific error messages
    if (err.message === 'No prayer settings found') {
      return res.status(400).json({ 
        msg: 'Prayer settings not found. Please configure your prayer settings first.',
        code: 'PRAYER_SETTINGS_MISSING'
      });
    }
    
    if (err.message === 'Calendar API error') {
      return res.status(503).json({ 
        msg: 'External calendar service is currently unavailable',
        code: 'EXTERNAL_API_ERROR'
      });
    }
    
    res.status(500).json({ 
      msg: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: err.message
    });
  }
});

module.exports = router;
