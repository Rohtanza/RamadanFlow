// Prayer-related constants
export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const PRAYER_LABELS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// API configuration
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Map configuration
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default values
export const DEFAULT_CALCULATION_METHOD = 'Karachi';
export const DEFAULT_ZOOM_LEVEL = 12;

// Cache configuration
export const PRAYER_TIMES_CACHE_DURATION = 1000 * 60 * 60; // 1 hour
export const STATS_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Validation
export const MAX_DAYS_FOR_STATS = 365;
export const MIN_DAYS_FOR_STATS = 1;

// Motivational quotes
export const MOTIVATIONAL_QUOTES = [
  'Consistency is the key to success!',
  'Every prayer brings you closer to peace.',
  'Small steps every day lead to big results.',
  'Your streak is your strength!',
  'Keep going, you are doing great!'
]; 