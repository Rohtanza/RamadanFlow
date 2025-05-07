// frontend/src/services/prayerService.js
import { getToken } from './authService';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/prayer';

/**
 * Save user’s location & method into DB
 */
export async function savePrayerSettings({ latitude, longitude, method }) {
    const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ latitude, longitude, method })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

/**
 * Fetch today’s prayer times from backend
 */
export async function fetchTodayPrayerTimes() {
    const res = await fetch(`${API}/today`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}
