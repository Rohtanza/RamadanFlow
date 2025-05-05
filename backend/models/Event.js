// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  hijriDate: { type: String, required: true }, // format "YYYY-MM-DD"
  gregDate:  { type: String, required: true }, // format "YYYY-MM-DD"
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate titles on the same date
EventSchema.index({ user: 1, hijriDate: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Event', EventSchema);
