const mongoose = require('mongoose');

const TasbihCounterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    default: 33    // e.g., default tasbih target
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TasbihCounter', TasbihCounterSchema);
