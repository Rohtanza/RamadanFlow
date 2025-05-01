const mongoose = require('mongoose');

const PrayerSettingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    default: 'MuslimSalat'      // you could expand later
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PrayerSetting', PrayerSettingSchema);
