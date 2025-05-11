const express = require('express');
const router = express.Router();
const RamadanGoal = require('../models/RamadanGoal');
const auth = require('../middleware/auth');

// Get all goals for a user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await RamadanGoal.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  const goal = new RamadanGoal({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    date: req.body.date
  });

  try {
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a goal
router.patch('/:id', auth, async (req, res) => {
  try {
    const goal = await RamadanGoal.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    Object.keys(req.body).forEach(key => {
      goal[key] = req.body[key];
    });

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await RamadanGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get goals by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const goals = await RamadanGoal.find({
      user: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 