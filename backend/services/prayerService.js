const axios = require('axios');

const API_KEY = process.env.PRAYER_API_KEY;

async function fetchPrayerTimes(city) {
  console.log("Fetching prayer times for:", latitude, longitude);

  const url = `https://muslimsalat.com/${city}/daily.json?key=${API_KEY}`;
  const resp = await axios.get(url);

  if (!resp.data || !resp.data.items || !resp.data.items[0]) {
    throw new Error('Prayer API error');
  }

  const todays = resp.data.items[0];
  return {
    fajr: todays.fajr,
    dhuhr: todays.dhuhr,
    asr:  todays.asr,
    maghrib: todays.maghrib,
    isha:  todays.isha,
    date: todays.date_for
  };
}

module.exports = { fetchPrayerTimes };
