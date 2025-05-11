const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['Study', 'Memorization', 'Favorite', 'Custom']
  },
  customCategory: {
    type: String,
    required: function() {
      return this.category === 'Custom';
    }
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
bookmarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bookmark', bookmarkSchema); 