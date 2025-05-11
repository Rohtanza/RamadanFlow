// backend/services/libraryService.js
const axios = require('axios');

const CDN   = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const LANGS = [
  'arabic', 'english', 'urdu', 'bengali', 'indonesian',
'french', 'turkish', 'russian', 'tamil'
];

/* ------------------------------------------------------------ *
 *  Utility: GET .min.json first, fall back to .json            *
 * ------------------------------------------------------------ */
async function fetchWithFallback(url) {
  try   { return (await axios.get(url.replace('.json', '.min.json'))).data; }
  catch { return (await axios.get(url)).data; }
}

/* ------------------------------------------------------------ *
 *  1.  List all editions (book‑language combos)                 *
 * ------------------------------------------------------------ */
async function getBooks() {
  const data = await fetchWithFallback(`${CDN}/editions.json`);  

  // data is { bookSlug: [ {name:"eng-bukhari", …}, … ], … }
  return data;
}

/* ------------------------------------------------------------ *
 *  2.  List chapters for one edition                            *
 * ------------------------------------------------------------ */
async function getChapters(edition) {
  const book = edition.split('-').slice(1).join('-');   // eng‑bukhari → bukhari
  const info = await fetchWithFallback(`${CDN}/info.json`);

  const sections = info?.[book]?.metadata?.sections || {};
  return Object.entries(sections)
  .filter(([num]) => +num)      // drop “0” intro if present
  .map(([num, title]) => ({ number: +num, title }));
}

/* ------------------------------------------------------------ *
 *  3.  Helper to normalise a hadith object                      *
 * ------------------------------------------------------------ */
function normaliseHadith(raw) {
  const h = {
    hadithNumber: raw.hadithnumber,
    grades      : raw.grades,
    reference   : raw.reference
  };

  LANGS.forEach(l => {
    if (raw[l]) h[`${l}Text`] = raw[l];
  });

  // Some editions use “body” / “text”
  if (!h.englishText && (raw.body || raw.text))
    h.englishText = raw.body || raw.text;

  return h;
}

/* ------------------------------------------------------------ *
 *  4.  All hadiths in one chapter                               *
 * ------------------------------------------------------------ */
async function getHadithsByChapter(edition, chapter) {
  const data = await fetchWithFallback(
    `${CDN}/editions/${edition}/sections/${chapter}.json`
  );
  return data.map(normaliseHadith);
}

/* ------------------------------------------------------------ *
 *  5.  Simple search inside one chapter                         *
 * ------------------------------------------------------------ */
async function searchHadiths(edition, chapter, query) {
  const list = await getHadithsByChapter(edition, chapter);
  const q    = query.toLowerCase();
  return list.filter(h =>
  Object.values(h)
  .filter(v => typeof v === 'string')
  .some(txt => txt.toLowerCase().includes(q))
  );
}

module.exports = {
  getBooks,
  getChapters,
  getHadithsByChapter,
  searchHadiths
};
