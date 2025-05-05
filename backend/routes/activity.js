const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @route GET /api/activity
// @desc  Get all logs for current user
// @access Private
router.get('/', auth, async (req, res) => {
  const logs = await ActivityLog.find({ user: req.user }).sort('-timestamp');
  res.json(logs);
});

module.exports = router;
