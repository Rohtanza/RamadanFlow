const mongoose = require('mongoose');

const juzSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  name: {
    type: String,
    required: true
  },
  startSurah: {
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
  endSurah: {
    type: Number,
    required: true,
    min: 1,
    max: 114
  },
  endAyah: {
    type: Number,
    required: true,
    min: 1
  }
});

module.exports = mongoose.model('Juz', juzSchema); 