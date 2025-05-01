import { getToken } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/azkar';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// Fetch full azkar content for a given type
export async function fetchAzkar(category) {
  const res = await fetch(`${API_URL}/${category}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load Azkar');
  return res.json();  // { title, content: [ { zekr, repeat, bless } ] }
}
