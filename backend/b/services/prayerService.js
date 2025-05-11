// backend/services/prayerService.js
const axios = require('axios');

const PRAYER_METHODS = {
  Karachi: 1,
  ISNA: 2,
  MWL: 3,
  Makkah: 4,
  Egypt: 5,
  Tehran: 7,
  Gulf: 8,
  Kuwait: 9,
  Qatar: 10,
  Singapore: 11,
  Turkey: 13,
  Dubai: 14,
  Morocco: 15
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @throws {Error} If coordinates are invalid
 */
function validateCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('Latitude and longitude must be numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
}

/**
 * Validate prayer calculation method
 * @param {string} method - Calculation method name
 * @throws {Error} If method is invalid
 */
function validateMethod(method) {
  if (!method || !PRAYER_METHODS[method]) {
    throw new Error(`Invalid prayer calculation method. Allowed methods: ${Object.keys(PRAYER_METHODS).join(', ')}`);
  }
}

/**
 * Format time string to HH:mm
 * @param {string} time - Time string from API
 * @returns {string} Formatted time
 */
function formatTime(time) {
  if (!time) return '--:--';
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

/**
 * Fetch prayer times for a given date & location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} method - Calculation method name
 * @returns {Promise<Object>} Prayer times and additional data
 */
async function fetchPrayerTimes(latitude, longitude, method = 'Karachi') {
  try {
    const methodNum = PRAYER_METHODS[method] || 1;
    const response = await axios.get(
      `http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${methodNum}`
    );

    const timings = response.data.data.timings;
    return {
      times: {
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha
      }
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw new Error('Failed to fetch prayer times');
  }
}

module.exports = {
  fetchPrayerTimes,
  validateCoordinates,
  validateMethod
};
