// src/services/quranService.js

import { getToken } from './authService';

const BASE_URL = 'https://quranapi.pages.dev/api';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// Get current bookmark
export async function getProgress() {
  const res = await fetch(`${BASE_URL}/progress`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

// Set bookmark
export async function setProgress(surah, ayah) {
  const res = await fetch(`${BASE_URL}/progress`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', ...authHeaders() },
                          body: JSON.stringify({ surah, ayah })
  });
  if (!res.ok) throw new Error('Failed to save progress');
  return res.json();
}

// Fetch list of all surahs
export const fetchSurahList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/surah.json`);
    if (!response.ok) throw new Error('Failed to fetch surah list');
    return await response.json();
  } catch (error) {
    console.error('Error fetching surah list:', error);
    throw error;
  }
};

// Fetch a specific verse
export const fetchVerse = async (surahNo, ayahNo) => {
  try {
    const response = await fetch(`${BASE_URL}/${surahNo}/${ayahNo}.json`);
    if (!response.ok) throw new Error('Failed to fetch verse');
    return await response.json();
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error;
  }
};

// Fetch entire surah
export const fetchSurah = async (surahNo) => {
  try {
    const response = await fetch(`${BASE_URL}/${surahNo}.json`);
    if (!response.ok) throw new Error('Failed to fetch surah');
    return await response.json();
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
};

// Fetch available reciters
export const fetchReciters = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reciters.json`);
    if (!response.ok) throw new Error('Failed to fetch reciters');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reciters:', error);
    throw error;
  }
};

// Get verse audio URL
export const getVerseAudioUrl = (reciterId, surahNo, ayahNo) => {
  // Format surah and ayah numbers to have leading zeros
  const formattedSurah = String(surahNo).padStart(3, '0');
  const formattedAyah = String(ayahNo).padStart(3, '0');
  return `https://the-quran-project.github.io/Quran-Audio/Data/${reciterId}/${surahNo}_${ayahNo}.mp3`;
};

// Get chapter audio URL
export const getChapterAudioUrl = async (surahNo) => {
  try {
    const response = await fetch(`${BASE_URL}/audio/${surahNo}.json`);
    if (!response.ok) throw new Error('Failed to fetch chapter audio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter audio:', error);
    throw error;
  }
};

// Get full translation
export const fetchTranslation = async (language) => {
  try {
    const response = await fetch(`${BASE_URL}/${language}.json`);
    if (!response.ok) throw new Error('Failed to fetch translation');
    return await response.json();
  } catch (error) {
    console.error('Error fetching translation:', error);
    throw error;
}
};
