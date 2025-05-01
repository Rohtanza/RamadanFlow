const axios = require('axios');
const apiKey = process.env.HADITH_API_KEY;
const BASE = 'https://hadithapi.com/api';

async function getBooks() {
  const url = `${BASE}/books?apiKey=${apiKey}`;
  const { data } = await axios.get(url);
  return data.books;
}

async function getChapters(bookSlug) {
  const url = `${BASE}/${bookSlug}/chapters?apiKey=${apiKey}`;
  const { data } = await axios.get(url);
  return data.chapters || [];
}

async function searchHadiths(params) {
  const url = new URL(`${BASE}/hadiths`);
  url.searchParams.set('apiKey', apiKey);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const { data } = await axios.get(url.toString());
  return data.hadiths || [];
}

module.exports = { getBooks, getChapters, searchHadiths };
