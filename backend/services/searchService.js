const Juz = require('../models/Juz');
const Ruku = require('../models/Ruku');
const Quran = require('../models/Quran');

// Get list of Juz

const getJuzList = async () => {
  try {
    const juzList = await Juz.find()
      .select('number name startSurah startAyah endSurah endAyah')
      .sort('number');
    return juzList;
  } catch (error) {
    throw new Error('Failed to get Juz list');
  }
};

// Get list of Ruku for a specific surah
const getRukuList = async (surahNumber) => {
  try {
    const rukuList = await Ruku.find({ surah: surahNumber })
      .select('number startAyah endAyah')
      .sort('number');
    return rukuList;
  } catch (error) {
    throw new Error('Failed to get Ruku list');
  }
};

// Get list of revelation types
const getRevelationTypes = async () => {
  try {
    const types = await Quran.distinct('revelationType');
    return types;
  } catch (error) {
    throw new Error('Failed to get revelation types');
  }
};

module.exports = {
  getJuzList,
  getRukuList,
  getRevelationTypes
}; 