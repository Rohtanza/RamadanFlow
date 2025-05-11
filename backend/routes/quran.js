const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecitationProgress = require('../models/RecitationProgress');
const { fetchSurah, getAudioUrl } = require('../services/quranService');


//Bookmark implementation

// @route   GET /api/quran/progress
// @desc    Get current user’s bookmark
// @access  Private
router.get('/progress', auth, async (req, res) => {
  const prog = await RecitationProgress.findOne({ user: req.user }).select('-_id surah ayah updatedAt');
  res.json(prog || null);
});

// @route   POST /api/quran/progress
// @desc    Create or update bookmark
// @body    { surah: Number, ayah: Number }
// @access  Private
router.post('/progress', auth, async (req, res) => {
  const { surah, ayah } = req.body;
  let prog = await RecitationProgress.findOne({ user: req.user });
  if (prog) {
    prog.surah = surah;
    prog.ayah = ayah;
    prog.updatedAt = Date.now();
  } else {
    prog = new RecitationProgress({ user: req.user, surah, ayah });
  }
  await prog.save();
  res.json({ surah: prog.surah, ayah: prog.ayah, updatedAt: prog.updatedAt });
});

// @route   GET /api/quran/surah/:num
// @desc    Fetch full surah text and translation
// @access  Private
router.get('/surah/:num', auth, async (req, res) => {
  try {
    const data = await fetchSurah(req.params.num);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch surah' });
  }
});

// @route   GET /api/quran/audio/:surah/:ayah
// @desc    Return audio URL for a specific ayah
// @access  Private
router.get('/audio/:surah/:ayah', auth, (req, res) => {
  const url = getAudioUrl(req.params.surah, req.params.ayah);
  res.json({ url });
});

module.exports = router;
