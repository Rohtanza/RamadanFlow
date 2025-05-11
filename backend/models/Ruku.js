const mongoose = require('mongoose');

const rukuSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1
  },
  surah: {
    type: Number,
    required: true,
    min: 1,
    max: 114
  },
  startAyah: {
    type: Number,
    required: true,
    min: 1
  },
  endAyah: {
    type: Number,
    required: true,
    min: 1
  }
});

// Compound index for surah and number
rukuSchema.index({ surah: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Ruku', rukuSchema); 