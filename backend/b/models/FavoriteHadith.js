// backend/models/FavoriteHadith.js
const mongoose = require('mongoose');

const FavoriteHadithSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  edition:  { type: String, required: true },   // e.g. 'eng-bukhari'
  chapter:  { type: Number, required: true },
  number:   { type: Number, required: true },   // hadithNumber
  hadith:   { type: Object, required: true },   // store the full hadith object
  createdAt:{ type: Date, default: Date.now }
});
FavoriteHadithSchema.index({ user:1, edition:1, chapter:1, number:1 }, { unique: true });

module.exports = mongoose.model('FavoriteHadith', FavoriteHadithSchema);
