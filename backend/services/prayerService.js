// backend/services/prayerService.js
const axios = require('axios');

const BASE_URL = 'https://api.islamicdevelopers.com/v1/calendar';
const ALLOWED_METHODS = [
  'MuslimWorldLeague','Egyptian','Karachi','UmmAlQura','Dubai',
'MoonsightingCommittee','NorthAmerica','Kuwait','Qatar',
'Singapore','Tehran','Turkey'
];

/**
 * Fetch prayer times for a given date & location
 * @param {number} lat
 * @param {number} lon
 * @param {string} method
 */
async function fetchPrayerTimes(lat, lon, method = 'Karachi') {
  if (!ALLOWED_METHODS.includes(method)) method = 'Karachi';

  const resp = await axios.get(BASE_URL, {
    params: {
      calendar: 'gregorian',
      year:     new Date().getFullYear(),
                               month:    new Date().getMonth() + 1,
                               day:      new Date().getDate(),
                               latitude:  lat,
                               longitude: lon,
                               method
    }
  });

  if (!Array.isArray(resp.data) || resp.data.length === 0) {
    throw new Error('Prayer API returned no data');
  }

  const { prayerTime } = resp.data[0];
  return {
    fajr:            `${prayerTime.fajr.hour}:${String(prayerTime.fajr.minute).padStart(2,'0')}`,
    dhuhr:           `${prayerTime.dhuhr.hour}:${String(prayerTime.dhuhr.minute).padStart(2,'0')}`,
    asr:             `${prayerTime.asr.hour}:${String(prayerTime.asr.minute).padStart(2,'0')}`,
    maghrib:         `${prayerTime.maghrib.hour}:${String(prayerTime.maghrib.minute).padStart(2,'0')}`,
    isha:            `${prayerTime.isha.hour}:${String(prayerTime.isha.minute).padStart(2,'0')}`,
    middleOfTheNight:`${prayerTime.middleOfTheNight.hour}:${String(prayerTime.middleOfTheNight.minute).padStart(2,'0')}`,
    lastThirdOfTheNight:`${prayerTime.lastThirdOfTheNight.hour}:${String(prayerTime.lastThirdOfTheNight.minute).padStart(2,'0')}`,
    timezone:        prayerTime.timezone
  };
}

module.exports = { fetchPrayerTimes };
