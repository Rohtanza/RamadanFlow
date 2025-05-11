// src/services/tasbihService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  console.log('Auth token:', token);
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  console.log('Request headers:', headers);
  return headers;
};

export const listCounters = async () => {
  const res = await fetch(`${API_URL}/tasbih`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch counters');
  return res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${API_URL}/tasbih/categories`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const createCounter = async (name, target, description = '', category = 'Other') => {
  const res = await fetch(`${API_URL}/tasbih`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ name, target, description, category })
  });
  if (!res.ok) throw new Error('Failed to create counter');
  return res.json();
};

export const incrementCounter = async (id) => {
  const res = await fetch(`${API_URL}/tasbih/${id}/inc`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to increment counter');
  return res.json();
};

export const decrementCounter = async (id, step = 1) => {
  const res = await fetch(`${API_URL}/tasbih/${id}/dec`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ step })
  });
  if (!res.ok) throw new Error('Failed to decrement counter');
  return res.json();
};

export const resetCounter = async (id) => {
  const res = await fetch(`${API_URL}/tasbih/${id}/reset`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to reset counter');
  return res.json();
};

export const updateCounter = async (id, name, target, description, category) => {
  const res = await fetch(`${API_URL}/tasbih/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ name, target, description, category })
  });
  if (!res.ok) throw new Error('Failed to update counter');
  return res.json();
};

export const deleteCounter = async (id) => {
  const res = await fetch(`${API_URL}/tasbih/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete counter');
  return res.json();
};
