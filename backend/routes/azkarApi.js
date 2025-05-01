const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { fetchZekr } = require('../services/azkarApiService');

// @route  GET /api/azkar
// @query  type=[m|e|as|t|bs|wu|qd|pd]
//         json=true
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const data = await fetchZekr({ type, json: true });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch Azkar/Dua' });
  }
});

module.exports = router;
