// src/services/tasbihService.js

import { getToken } from './authService';

const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, '');
const TASBIH_URL = `${API_BASE}/tasbih`;

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export async function listCounters() {
  const res = await fetch(TASBIH_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load counters');
  return res.json();
}

export async function createCounter(name, target) {
  const res = await fetch(TASBIH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                          body: JSON.stringify({ name, target })
  });
  if (!res.ok) throw new Error('Failed to create counter');
  return res.json();
}

export async function incrementCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}/inc`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to increment');
  return res.json();
}

export async function decrementCounter(id, step = 1) {
  const res = await fetch(`${TASBIH_URL}/${id}/dec`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                          body: JSON.stringify({ step })
  });
  if (!res.ok) throw new Error('Failed to decrement');
  return res.json();
}

export async function resetCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}/reset`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to reset');
  return res.json();
}

export async function updateCounter(id, name, target) {
  const res = await fetch(`${TASBIH_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                          body: JSON.stringify({ name, target })
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

export async function deleteCounter(id) {
  const res = await fetch(`${TASBIH_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}
