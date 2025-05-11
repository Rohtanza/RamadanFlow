const mongoose = require('mongoose');

const TasbihCounterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['Morning', 'Evening', 'Prayer', 'Custom', 'Other'],
    default: 'Other'
  },
  count: {
    type: Number,
    default: 0,
    min: [0, 'Count cannot be negative']
  },
  target: {
    type: Number,
    default: 33,
    min: [1, 'Target must be at least 1']
  },
  lastCounted: {
    type: Date,
    default: Date.now
  },
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Add timestamps for better tracking
});

// Add indexes for better query performance
TasbihCounterSchema.index({ user: 1, createdAt: -1 });
TasbihCounterSchema.index({ user: 1, category: 1 });
TasbihCounterSchema.index({ user: 1, lastCounted: -1 });

module.exports = mongoose.model('TasbihCounter', TasbihCounterSchema);
