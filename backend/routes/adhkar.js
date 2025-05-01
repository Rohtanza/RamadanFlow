// backend/routes/azkar.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { getAzkar } = require('../services/azkarService');

/**
 * GET /api/azkar?type=<m|e|as|t|bs|wu|qd|pd>
 * Returns an array of adhkar strings.
 */
router.get('/', auth, (req, res) => {
  const { type } = req.query;           // e.g. ?m=true or ?type=m
  const key = type?.replace(/=.*/,'');  // just in case they passed “m=true”
  const list = getAzkar(key);
  res.json({ category: key||'all', count: list.length, items: list });
});

module.exports = router;
