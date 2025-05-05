// frontend/src/services/eventService.js
import { getToken } from './authService';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const listEvents = async () => {
  const res = await fetch(`${API}/events`, {
    headers:{ Authorization:`Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to load events');
  return res.json();
};

export const createEvent = async (title, hijriDate, gregDate) => {
  const res = await fetch(`${API}/events`, {
    method: 'POST',
    headers:{
      'Content-Type':'application/json',
      Authorization:`Bearer ${getToken()}`
    },
    body: JSON.stringify({ title, hijriDate, gregDate })
  });
  if (!res.ok) throw new Error((await res.json()).msg || 'Create failed');
  return res.json();
};

export const deleteEvent = async id => {
  const res = await fetch(`${API}/events/${id}`, {
    method: 'DELETE',
    headers:{ Authorization:`Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};
