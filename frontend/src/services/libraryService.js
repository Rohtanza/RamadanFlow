// frontend/src/services/libraryService.js
import { getToken } from './authService';
const API = import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/library';

async function fetchBooks() {
  const res = await fetch(`${API}/books`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to load books');
  return res.json();
}

async function fetchChapters(edition) {
  const res = await fetch(`${API}/books/${edition}/chapters`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to load chapters');
  return res.json();
}

async function fetchChapterHadiths(edition, chapter) {
  const res = await fetch(`${API}/books/${edition}/chapters/${chapter}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to load hadiths');
  return res.json();
}

async function searchHadiths(edition, chapter, q) {
  const res = await fetch(
    `${API}/books/${edition}/chapters/${chapter}/search?q=${encodeURIComponent(q)}`,
                          { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function addFavorite(fav) {
  const res = await fetch(`${API}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(fav)
  });
  if (!res.ok) throw new Error('Add favorite failed');
  return res.json();
}

async function removeFavorite(id) {
  await fetch(`${API}/favorites/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}

export {
  fetchBooks,
  fetchChapters,
  fetchChapterHadiths,
  searchHadiths,
  addFavorite,
  removeFavorite
};
