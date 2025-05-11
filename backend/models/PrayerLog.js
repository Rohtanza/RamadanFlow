const mongoose = require('mongoose');

const prayerLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prayer: {
    type: String,
    enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique prayers per user per day
prayerLogSchema.index({ user: 1, prayer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PrayerLog', prayerLogSchema);
