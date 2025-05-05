// backend/routes/library.js
const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/auth');
const {
  getBooks,
  getChapters,
  getHadithsByChapter,
  searchHadiths
} = require('../services/libraryService');
const FavoriteHadith = require('../models/FavoriteHadith');

/* --------  Books (editions) -------- */
router.get('/books', auth, async (_req, res) => {
  try   { res.json(await getBooks()); }
  catch (e){ res.status(500).json({ msg: e.message }); }
});

/* --------  Chapters for an edition -------- */
router.get('/books/:edition/chapters', auth, async (req, res) => {
  try   { res.json(await getChapters(req.params.edition)); }
  catch (e){ res.status(500).json({ msg: e.message }); }
});

/* --------  Hadiths in a chapter -------- */
router.get('/books/:edition/chapters/:chapter', auth, async (req, res) => {
  try {
    const { edition, chapter } = req.params;
    res.json(await getHadithsByChapter(edition, chapter));
  } catch(e){
    res.status(500).json({ msg: e.message });
  }
});

/* --------  Search inside a chapter -------- */
router.get('/books/:edition/chapters/:chapter/search', auth, async (req, res) => {
  try {
    const { edition, chapter } = req.params;
    const { q } = req.query;
    res.json(await searchHadiths(edition, chapter, q || ''));
  } catch(e){
    res.status(500).json({ msg: e.message });
  }
});

/* --------  Favourite CRUD -------- */
router.post('/favorites', auth, async (req, res) => {
  const { edition, chapter, number, hadith } = req.body;
  try {
    const fav = new FavoriteHadith({
      user: req.user,
      edition,
      chapter,
      number,
      hadith
    });
    await fav.save();
    res.json(fav);
  } catch {
    res.status(400).json({ msg: 'Already favorited' });
  }
});

router.delete('/favorites/:id', auth, async (req, res) => {
  await FavoriteHadith.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ success: true });
});

module.exports = router;
