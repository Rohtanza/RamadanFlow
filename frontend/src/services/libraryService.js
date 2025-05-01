import { getToken } from './authService';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/library';

function headers(json = false) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export async function fetchBooks() {
  const res = await fetch(`${API}/books`, { headers: headers() });
  if (!res.ok) throw new Error();
  return res.json();
}

export async function fetchChapters(slug) {
  const res = await fetch(`${API}/books/${slug}/chapters`, { headers: headers() });
  if (!res.ok) throw new Error();
  return res.json();
}

export async function fetchHadiths(params) {
  const query = new URLSearchParams({ ...params });
  const res = await fetch(`${API}/hadiths?${query}`, { headers: headers() });
  if (!res.ok) throw new Error();
  const data = await res.json();
  return Array.isArray(data) ? data : (data.hadiths || []);
}

export async function fetchFavorites() {
  const res = await fetch(`${API}/favorites`, { headers: headers() });
  if (!res.ok) throw new Error();
  return res.json();
}

export async function addFavorite(fav) {
  const res = await fetch(`${API}/favorites`, {
    method: 'POST', headers: headers(true), body: JSON.stringify(fav)
  });
  if (!res.ok) throw new Error();
  return res.json();
}

export async function removeFavorite(id) {
  const res = await fetch(`${API}/favorites/${id}`, { method: 'DELETE', headers: headers() });
  if (!res.ok) throw new Error();
  return res.json();
}
