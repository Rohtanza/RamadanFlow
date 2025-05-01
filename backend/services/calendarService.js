// backend/services/calendarService.js
const axios = require('axios');
const PrayerSetting = require('../models/PrayerSetting');

const BASE_URL = 'https://api.islamicdevelopers.com/v1/calendar';

const ALLOWED_METHODS = [
  'MuslimWorldLeague', 'Egyptian', 'Karachi', 'UmmAlQura', 'Dubai',
'MoonsightingCommittee', 'NorthAmerica', 'Kuwait', 'Qatar',
'Singapore', 'Tehran', 'Turkey'
];

// Static list of major Islamic events (Hijri calendar)
const ISLAMIC_EVENTS = [
  { month: 1,  day: 1,  name: 'Islamic New Year' },
{ month: 1,  day: 10, name: 'Ashura' },
{ month: 3,  day: 12, name: 'Mawlid an-Nabi (Prophet’s Birthday)' },
{ month: 9,  day: 1,  name: 'Start of Ramadan' },
{ month: 9,  day: 27, name: 'Laylat al-Qadr (estimated)' },
{ month: 10, day: 1,  name: 'Eid al-Fitr' },
{ month: 12, day: 8,  name: 'Start of Hajj' },
{ month: 12, day: 9,  name: 'Day of Arafah' },
{ month: 12, day: 10, name: 'Eid al-Adha' }
];

async function fetchTodayCalendar(userId) {
  const setting = await PrayerSetting.findOne({ user: userId });
  if (!setting) throw new Error('No prayer settings found');

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const day   = now.getDate();

  let method = setting.method || 'Karachi';
  if (!ALLOWED_METHODS.includes(method)) {
    method = 'Karachi';
  }

  const resp = await axios.get(BASE_URL, {
    params: {
      calendar: 'gregorian',
      year,
      month,
      day,
      method,
      latitude: setting.latitude,
      longitude: setting.longitude
    }
  });

  if (!resp.data || !Array.isArray(resp.data) || resp.data.length === 0) {
    throw new Error('Calendar API error');
  }

  const today = resp.data[0];

  // Calculate upcoming events
  const currentHijriMonth = today.calendar.hijri.numeric.month;
  const currentHijriDay   = today.calendar.hijri.numeric.day;
  const currentHijriYear  = today.calendar.hijri.numeric.year;

  // Find upcoming events (sorted)
  const upcomingEvents = ISLAMIC_EVENTS
  .filter(e => (e.month > currentHijriMonth) || (e.month === currentHijriMonth && e.day >= currentHijriDay))
  .map(e => ({
    name: e.name,
    hijriDate: `${currentHijriYear}-${String(e.month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`
  }));

  return {
    hijri: today.calendar.hijri,
    gregorian: today.calendar.gregorian,
    upcomingEvents
  };
}

module.exports = { fetchTodayCalendar };
