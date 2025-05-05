// src/services/tasbihService.js

import { getToken } from './authService';

const API_BASE  = import.meta.env.VITE_API_URL.replace(/\/$/, '');
const TASBIH_URL = `${API_BASE}/tasbih`;

function authHeaders(contentType = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (contentType) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function listCounters() {
  const res = await fetch(TASBIH_URL, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(`List failed (${res.status})`);
  return res.json();
}

export async function createCounter(name, target) {
  const res = await fetch(TASBIH_URL, {
    method: 'POST',
    headers: authHeaders(true),
                          body: JSON.stringify({ name, target })
  });
  if (!res.ok) throw new Error(`Create failed (${res.status})`);
  return res.json();
}

export async function incrementCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}/inc`, {
    method: 'PATCH',
    headers: authHeaders(true)
  });
  if (!res.ok) throw new Error(`Increment failed (${res.status})`);
  return res.json();
}

export async function decrementCounter(id, step = 1) {
  const res = await fetch(`${TASBIH_URL}/${id}/dec`, {
    method: 'PATCH',
    headers: authHeaders(true),
                          body: JSON.stringify({ step })
  });
  if (!res.ok) throw new Error(`Decrement failed (${res.status})`);
  return res.json();
}

export async function resetCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}/reset`, {
    method: 'PATCH',
    headers: authHeaders(true)
  });
  if (!res.ok) throw new Error(`Reset failed (${res.status})`);
  return res.json();
}

export async function updateCounter(id, name, target) {
  const res = await fetch(`${TASBIH_URL}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(true),
                          body: JSON.stringify({ name, target })
  });
  if (!res.ok) throw new Error(`Update failed (${res.status})`);
  return res.json();
}

export async function deleteCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  return res.json();
}
