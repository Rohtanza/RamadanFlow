// backend/routes/tasbih.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TasbihCounter = require('../models/TasbihCounter');

// GET /api/tasbih
router.get('/', auth, async (req, res) => {
  const counters = await TasbihCounter.find({ user: req.user }).sort('-createdAt');
  res.json(counters);
});

// POST /api/tasbih
router.post('/', auth, async (req, res) => {
  const { name, target } = req.body;
  try {
    const counter = new TasbihCounter({
      user: req.user,
      name,
      target: target || 33
    });
    await counter.save();
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/tasbih/:id/inc
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

// PATCH /api/tasbih/:id/dec
router.patch('/:id/dec', auth, async (req, res) => {
  try {
    const { step = 1 } = req.body;
    const counter = await TasbihCounter.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { $inc: { count: -Math.abs(step) } },
                                                         { new: true }
    );
    if (!counter) return res.status(404).json({ msg: 'Not found' });
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/tasbih/:id/reset
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

// PATCH /api/tasbih/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, target } = req.body;
    const counter = await TasbihCounter.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { name, target },
      { new: true }
    );
    if (!counter) return res.status(404).json({ msg: 'Not found' });
    res.json(counter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/tasbih/:id
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
