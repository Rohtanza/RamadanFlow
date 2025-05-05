// backend/routes/events.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Event   = require('../models/Event');

// GET /api/events — list all your events
router.get('/', auth, async (req, res) => {
  try {
    const evs = await Event.find({ user: req.user }).sort('hijriDate');
    res.json(evs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch events' });
  }
});

// POST /api/events — create an event { title, hijriDate, gregDate }
router.post('/', auth, async (req, res) => {
  const { title, hijriDate, gregDate } = req.body;
  try {
    const ev = new Event({ user: req.user, title, hijriDate, gregDate });
    await ev.save();
    res.json(ev);
  } catch (e) {
    console.error(e);
    if (e.code === 11000) {
      return res.status(400).json({ msg: 'You already have that event on this date.' });
    }
    res.status(400).json({ msg: e.message });
  }
});

// DELETE /api/events/:id — remove one of your events
router.delete('/:id', auth, async (req, res) => {
  try {
    await Event.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete event' });
  }
});

module.exports = router;
