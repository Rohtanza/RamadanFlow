const mongoose = require('mongoose');

const searchSuggestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
});

// Index for text and translation fields
searchSuggestionSchema.index({ text: 'text', translation: 'text' });

module.exports = mongoose.model('SearchSuggestion', searchSuggestionSchema); 