const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/auth');

// Get all bookmarks
router.get('/', auth, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
});

// Get bookmarks by category
router.get('/category/:category', auth, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({
            user: req.user.id,
            category: req.params.category
        }).sort({ createdAt: -1 });
        
        res.json(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks by category:', error);
        res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
});

// Create a new bookmark
router.post('/', auth, async (req, res) => {
    try {
        const { surahNumber, ayahNumber, category, notes } = req.body;
        
        const bookmark = new Bookmark({
            user: req.user.id,
            surahNumber,
            ayahNumber,
            category,
            notes
        });

        const savedBookmark = await bookmark.save();
        res.status(201).json(savedBookmark);
    } catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({ message: 'Failed to create bookmark' });
    }
});

// Update a bookmark
router.put('/:id', auth, async (req, res) => {
    try {
        const { category, notes } = req.body;
        const bookmark = await Bookmark.findOne({ 
            _id: req.params.id,
            user: req.user.id 
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        bookmark.category = category || bookmark.category;
        bookmark.notes = notes || bookmark.notes;
        
        const updatedBookmark = await bookmark.save();
        res.json(updatedBookmark);
    } catch (error) {
        console.error('Error updating bookmark:', error);
        res.status(500).json({ message: 'Failed to update bookmark' });
    }
});

// Delete a bookmark
router.delete('/:id', auth, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ message: 'Failed to delete bookmark' });
    }
});

// Export bookmarks
router.get('/export', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .select('-user -__v')
      .sort('-createdAt');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export bookmarks' });
  }
});

// Import bookmarks
router.post('/import', auth, async (req, res) => {
  try {
    const bookmarks = req.body.map(bookmark => ({
      ...bookmark,
      user: req.user.id
    }));
    await Bookmark.insertMany(bookmarks);
    res.json({ message: 'Bookmarks imported successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to import bookmarks' });
  }
});

module.exports = router; 