const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TasbihCounter = require('../models/TasbihCounter');

// @route   GET /api/tasbih
// @desc    List all counters for user
// @access  Private
router.get('/', auth, async (req, res) => {
  const counters = await TasbihCounter.find({ user: req.user });
  res.json(counters);
});

// @route   POST /api/tasbih
// @desc    Create a new counter
// @body    { name: String, target?: Number }
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, target } = req.body;
  try {
    const counter = new TasbihCounter({
      user: req.user,
      name,
      target: target || undefined
    });
    await counter.save();
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PATCH /api/tasbih/:id/inc
// @desc    Increment counter by 1
// @access  Private
router.patch('/:id/inc', auth, async (req, res) => {
  try {
    const counter = await TasbihCounter.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { $inc: { count: 1 } },
      { new: true }
    );
    if (!counter) return res.status(404).json({ msg: 'Not found' });
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PATCH /api/tasbih/:id/reset
// @desc    Reset counter to zero
// @access  Private
router.patch('/:id/reset', auth, async (req, res) => {
  try {
    const counter = await TasbihCounter.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { count: 0 },
      { new: true }
    );
    if (!counter) return res.status(404).json({ msg: 'Not found' });
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/tasbih/:id
// @desc    Delete a counter
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await TasbihCounter.findOneAndDelete({
      _id: req.params.id,
      user: req.user
    });
    if (!result) return res.status(404).json({ msg: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
