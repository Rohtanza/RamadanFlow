// backend/models/PrayerSetting.js
const mongoose = require('mongoose');

const PrayerSettingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  method: {
    type: String,
    required: [true, 'Calculation method is required'],
    default: 'Karachi',
    enum: {
      values: ['Karachi', 'ISNA', 'MWL', 'UmmAlQura', 'Egyptian', 'Tehran', 'Gulf', 'Kuwait', 'Qatar', 'Singapore', 'Turkey', 'Dubai', 'Morocco'],
      message: '{VALUE} is not a valid calculation method'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
PrayerSettingSchema.index({ user: 1 });

// Add validation method
PrayerSettingSchema.methods.validateCoordinates = function() {
  if (this.latitude < -90 || this.latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (this.longitude < -180 || this.longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  return true;
};

module.exports = mongoose.model('PrayerSetting', PrayerSettingSchema);
