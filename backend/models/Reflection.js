const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    enum: ['Grateful', 'Reflective', 'Challenged', 'Inspired', 'Peaceful', 'Other'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
reflectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reflection', reflectionSchema); 