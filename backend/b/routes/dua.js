// backend/routes/dua.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { fetchRandomHadith } = require('../services/duaService');

/**
 * GET /api/dua/hadith
 * Returns a random hadith/dua from the external API.
 */
router.get('/hadith', auth, async (req, res) => {
  try {
    const data = await fetchRandomHadith();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not fetch hadith' });
  }
});

module.exports = router;
