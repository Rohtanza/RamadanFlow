const mongoose = require('mongoose');

const RecitationProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surah: {
    type: Number,
    required: true,
    min: 1,
    max: 114
  },
  ayah: {
    type: Number,
    required: true,
    min: 1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// One bookmark document per user
RecitationProgressSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('RecitationProgress', RecitationProgressSchema);
