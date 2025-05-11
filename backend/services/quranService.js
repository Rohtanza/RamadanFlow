const axios = require('axios');

// Fetch a full Surah (text and English translation) from alquran.cloud
async function fetchSurah(surahNumber) {
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`;
  const resp = await axios.get(url);
  if (!resp.data || resp.data.code !== 200) {
    throw new Error('Failed to fetch surah');
  }
  return resp.data.data; // contains ayahs[], englishName, etc.
}

// Fetch audio URL for a given ayah (reciter: e.g., "ar.alafasy")
function getAudioUrl(surah, ayah, reciter = 'ar.alafasy') {
  return `https://cdn.alquran.cloud/media/audio/alphafasy/64/${surah}/${ayah}`;
}

module.exports = { fetchSurah, getAudioUrl };
