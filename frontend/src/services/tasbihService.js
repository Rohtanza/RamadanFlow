import { getToken } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasbih';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// List all counters
export async function listCounters() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load counters');
  return res.json();
}

// Create a new counter
export async function createCounter(name, target) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', ...authHeaders() },
    body: JSON.stringify({ name, target })
  });
  if (!res.ok) throw new Error('Failed to create counter');
  return res.json();
}

// Increment counter by 1
export async function incrementCounter(id) {
  const res = await fetch(`${API_URL}/${id}/inc`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to increment');
  return res.json();
}

// Reset counter to zero
export async function resetCounter(id) {
  const res = await fetch(`${API_URL}/${id}/reset`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to reset');
  return res.json();
}

// Delete a counter
export async function deleteCounter(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}
