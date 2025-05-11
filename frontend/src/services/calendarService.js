// frontend/src/services/calendarService.js
import { getToken } from './authService'

// Base URL for your API; VITE_API_URL should be set to http://localhost:5000/api in .env
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api'

/**
 * Fetch today's (or a given date's) calendar data.
 * @param {string} [calendarDate] in YYYY-MM-DD format; if omitted, server uses today.
 */
export async function fetchTodayCalendar(calendarDate) {
  const url = new URL(`${API_BASE}/calendar/today`, window.location.origin)
  if (calendarDate) {
    // if your backend is extended to accept ?date=YYYY-MM-DD
    url.searchParams.set('date', calendarDate)
  }
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    throw new Error(`Calendar API error: ${res.status}`)
  }
  return res.json()
}
