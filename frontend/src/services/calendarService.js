import { getToken } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/calendar';

export async function fetchTodayCalendar() {
  const res = await fetch(`${API_URL}/today`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to load calendar data');
  return res.json();
}
