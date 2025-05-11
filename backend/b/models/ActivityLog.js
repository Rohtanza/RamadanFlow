const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'LOGIN',
      'REGISTER',
      'LOGOUT',
      'PRAYER_LOG',
      'PRAYER_UNLOG',
      'PROFILE_UPDATE',
      'SETTINGS_UPDATE'
    ],
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for fetching user activities
ActivityLogSchema.index({ user: 1, timestamp: -1 });

// Virtual for formatted timestamp
ActivityLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Method to format activity for display
ActivityLogSchema.methods.formatForDisplay = function() {
  return {
    action: this.action,
    details: this.details,
    timestamp: this.formattedTimestamp
  };
};

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
