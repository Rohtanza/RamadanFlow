const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @route GET /api/activity
// @desc  Get all logs for current user
// @access Private
router.get('/', auth, async (req, res) => {
  console.log('Activity route hit - User:', req.user._id);
  try {
    const logs = await ActivityLog.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100);
    console.log('Found logs:', logs.length);

    // Format the logs for better readability
    const formattedLogs = logs.map(log => ({
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
