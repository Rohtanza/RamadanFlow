const mongoose = require('mongoose');

const FavoriteHadithSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookSlug: { type: String, required: true },
  hadithNumber: { type: Number, required: true },
  hadith: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

FavoriteHadithSchema.index({ user: 1, bookSlug: 1, hadithNumber: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteHadith', FavoriteHadithSchema);
