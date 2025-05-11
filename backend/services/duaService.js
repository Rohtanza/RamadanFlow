// backend/services/duaService.js
const axios = require('axios');

// fetch a random dua/hadith
async function fetchRandomHadith() {
  const resp = await axios.get('https://hadithapi.com/api/random'); 
  return resp.data;
}

module.exports = { fetchRandomHadith };
