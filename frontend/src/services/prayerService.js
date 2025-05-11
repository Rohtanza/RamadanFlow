// Simple prayer service
import axios from 'axios';
import { getToken } from './authService';
import { formatDate } from '../utils/dateUtils';

const API_BASE = 'http://localhost:5000/api';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Simple axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || { msg: 'An unexpected error occurred.' };
  }
);

export const getPrayerTimes = async (latitude, longitude, method = 'Karachi') => {
  const response = await api.post('/prayer/times', { latitude, longitude, method });
  return response.data;
};

export const togglePrayer = async (prayer) => {
  const date = formatDate();
  const response = await api.post('/prayer/log', { prayer, date });
  return response.data;
};

export const getPrayerStats = async (days = 7) => {
  const response = await api.get('/prayer/stats', { params: { days } });
  return response.data;
};

export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place`
    );
    if (response.ok) {
      const data = await response.json();
      return data.features?.[0]?.text || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.warn('Failed to get location name:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};
