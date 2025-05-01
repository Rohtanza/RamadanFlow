const mongoose = require('mongoose');

const AdhkarLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one log per user/category/date
AdhkarLogSchema.index({ user: 1, category: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AdhkarLog', AdhkarLogSchema);
