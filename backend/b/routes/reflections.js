const express = require('express');
const router = express.Router();
const Reflection = require('../models/Reflection');
const auth = require('../middleware/auth');

// Get all reflections for a user
router.get('/', auth, async (req, res) => {
  try {
    const reflections = await Reflection.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(reflections);
  } catch (error) {
    console.error('Error fetching reflections:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new reflection
router.post('/', auth, async (req, res) => {
  try {
    const reflection = new Reflection({
      user: req.user.id,
      content: req.body.content,
      mood: req.body.mood,
      tags: req.body.tags || [],
      date: req.body.date
    });

    const newReflection = await reflection.save();
    res.status(201).json(newReflection);
  } catch (error) {
    console.error('Error creating reflection:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a reflection
router.patch('/:id', auth, async (req, res) => {
  try {
    const reflection = await Reflection.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'user') { // Prevent changing the user
        reflection[key] = req.body[key];
      }
    });

    const updatedReflection = await reflection.save();
    res.json(updatedReflection);
  } catch (error) {
    console.error('Error updating reflection:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a reflection
router.delete('/:id', auth, async (req, res) => {
  try {
    const reflection = await Reflection.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    res.json({ message: 'Reflection deleted' });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get reflections by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const reflections = await Reflection.find({
      user: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    
    res.json(reflections);
  } catch (error) {
    console.error('Error fetching reflections by range:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get reflections by mood
router.get('/mood/:mood', auth, async (req, res) => {
  try {
    const reflections = await Reflection.find({
      user: req.user.id,
      mood: req.params.mood
    }).sort({ date: -1 });
    
    res.json(reflections);
  } catch (error) {
    console.error('Error fetching reflections by mood:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 