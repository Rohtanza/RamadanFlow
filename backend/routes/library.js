const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getBooks, getChapters, searchHadiths } = require('../services/libraryService');
const FavoriteHadith = require('../models/FavoriteHadith');

// Books list
router.get('/books', auth, async (req, res) => {
  try { res.json(await getBooks()); }
  catch (e) { res.status(500).json({ msg: e.message }); }
});

// Chapters for a book
router.get('/books/:slug/chapters', auth, async (req, res) => {
  try { res.json(await getChapters(req.params.slug)); }
  catch (e) { res.status(500).json({ msg: e.message }); }
});

// Search hadiths
router.get('/hadiths', auth, async (req, res) => {
  try { res.json(await searchHadiths(req.query)); }
  catch (e) { res.status(500).json({ msg: e.message }); }
});

// Favorites: list
router.get('/favorites', auth, async (req, res) => {
  const favs = await FavoriteHadith.find({ user: req.user });
  res.json(favs);
});

// Add to favorites
router.post('/favorites', auth, async (req, res) => {
  const { bookSlug, hadithNumber, hadith } = req.body;
  try {
    const fav = new FavoriteHadith({ user: req.user, bookSlug, hadithNumber, hadith });
    await fav.save();
    res.json(fav);
  } catch (e) {
    res.status(400).json({ msg: 'Already in favorites' });
  }
});

// Remove favorite
router.delete('/favorites/:id', auth, async (req, res) => {
  await FavoriteHadith.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ success: true });
});

module.exports = router;
