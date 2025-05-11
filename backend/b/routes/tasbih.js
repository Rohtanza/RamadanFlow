// backend/routes/tasbih.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TasbihCounter = require('../models/TasbihCounter');

// GET /api/tasbih
router.get('/', auth, async (req, res) => {
  try {
    const counters = await TasbihCounter.find({ user: req.user.id })
      .sort('-createdAt');
    res.json(counters);
  } catch (err) {
    console.error('Error fetching counters:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/tasbih/categories
router.get('/categories', auth, async (req, res) => {
  try {
    const defaultCategories = ['Morning', 'Evening', 'Prayer', 'Custom', 'Other'];
    const userCategories = await TasbihCounter.distinct('category', { user: req.user.id });
    // Merge default categories with user's custom categories
    const allCategories = [...new Set([...defaultCategories, ...userCategories])];
    res.json(allCategories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/tasbih
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating tasbih counter with data:', req.body);
    console.log('User ID from auth:', req.user.id);
    
    const { name, target, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }

    const counter = new TasbihCounter({
      user: req.user.id,
      name,
      target: target || 33,
      description: description || '',
      category: category || 'Other',
      lastCounted: new Date(),
      streak: 0
    });

    console.log('New counter object:', counter);
    
    const savedCounter = await counter.save();
    console.log('Saved counter:', savedCounter);
    
    res.json(savedCounter);
  } catch (err) {
    console.error('Error creating counter:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      msg: 'Server error',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Helper function to update streak
const updateStreak = async (counter) => {
  const now = new Date();
  const lastCounted = new Date(counter.lastCounted);
  const diffDays = Math.floor((now - lastCounted) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    counter.streak += 1;
  } else if (diffDays > 1) {
    counter.streak = 1;
  }
  
  counter.lastCounted = now;
  return counter;
};

// PATCH /api/tasbih/:id/inc
router.patch('/:id/inc', auth, async (req, res) => {
  try {
    let counter = await TasbihCounter.findOne({ _id: req.params.id, user: req.user.id });
    if (!counter) return res.status(404).json({ msg: 'Not found' });

    counter = await updateStreak(counter);
    counter.count += 1;
    await counter.save();
    
    res.json(counter);
  } catch (err) {
    console.error('Error incrementing counter:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/tasbih/:id/dec
router.patch('/:id/dec', auth, async (req, res) => {
  try {
    const { step = 1 } = req.body;
    let counter = await TasbihCounter.findOne({ _id: req.params.id, user: req.user.id });
    if (!counter) return res.status(404).json({ msg: 'Not found' });

    counter = await updateStreak(counter);
    counter.count = Math.max(0, counter.count - Math.abs(step));
    await counter.save();
    
    res.json(counter);
  } catch (err) {
    console.error('Error decrementing counter:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/tasbih/:id/reset
router.patch('/:id/reset', auth, async (req, res) => {
  try {
    let counter = await TasbihCounter.findOne({ _id: req.params.id, user: req.user.id });
    if (!counter) return res.status(404).json({ msg: 'Not found' });

    counter.count = 0;
    counter.streak = 0;
    counter.lastCounted = new Date();
    await counter.save();
    
    res.json(counter);
  } catch (err) {
    console.error('Error resetting counter:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/tasbih/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, target, description, category } = req.body;
    const counter = await TasbihCounter.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, target, description, category },
      { new: true }
    );
    if (!counter) return res.status(404).json({ msg: 'Not found' });
    res.json(counter);
  } catch (err) {
    console.error('Error updating counter:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/tasbih/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await TasbihCounter.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!result) return res.status(404).json({ msg: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting counter:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
