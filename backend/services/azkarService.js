const fs = require('fs');
const path = require('path');

function loadAzkar(filename) {
  const filepath = path.join(__dirname, '..', 'data', filename);
  const fileData = fs.readFileSync(filepath, 'utf-8');
  const jsonData = JSON.parse(fileData);
  return jsonData;
}

function getMorningAzkar() {
  return loadAzkar('azkar_sabah.json');
}

function getEveningAzkar() {
  return loadAzkar('azkar_massa.json');
}

function getPostPrayerAzkar() {
  return loadAzkar('PostPrayer_azkar.json');
}

module.exports = { getMorningAzkar, getEveningAzkar, getPostPrayerAzkar };
