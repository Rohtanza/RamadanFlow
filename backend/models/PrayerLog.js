const mongoose = require('mongoose');

const PrayerLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prayer: {
    type: String,
    enum: ['fajr','dhuhr','asr','maghrib','isha'],
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

// ensure one log per prayer per day
PrayerLogSchema.index({ user: 1, prayer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PrayerLog', PrayerLogSchema);
