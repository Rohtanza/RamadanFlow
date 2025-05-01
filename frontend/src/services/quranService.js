import { getToken } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/quran';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// Get current bookmark
export async function getProgress() {
  const res = await fetch(`${API_URL}/progress`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

// Set bookmark
export async function setProgress(surah, ayah) {
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', ...authHeaders() },
    body: JSON.stringify({ surah, ayah })
  });
  if (!res.ok) throw new Error('Failed to save progress');
  return res.json();
}

// Fetch a full surah
export async function fetchSurah(surahNumber) {
  const res = await fetch(`${API_URL}/surah/${surahNumber}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch surah');
  return res.json();
}

// Get audio URL for an ayah
export async function fetchAudioUrl(surah, ayah) {
  const res = await fetch(`${API_URL}/audio/${surah}/${ayah}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audio URL');
  const { url } = await res.json();
  return url;
}
