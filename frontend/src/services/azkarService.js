// src/services/azkarService.js

import { getToken } from './authService'

const API_ROOT = 'http://localhost:5000/api/azkar'
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

const ENDPOINTS = {
  m: 'morning',
  e: 'evening',
  as: 'post-prayer'
}

/**
 * Fetch Azkar for one category.
 * Returns: Array<string> or Array<object>
 */
export async function fetchAzkar(category) {
  const ep = ENDPOINTS[category]
  if (!ep) throw new Error(`Unknown Azkar category "${category}"`)

    const res = await fetch(`${API_ROOT}/${ep}`, {
      headers: authHeaders()
    })
    if (!res.ok) {
      throw new Error(`Failed to load ${ep} Azkar: status ${res.status}`)
    }

    const payload = await res.json()

    // Unwrap various shapes
    if (Array.isArray(payload)) {
      return payload
    }
    if (Array.isArray(payload.items)) {
      return payload.items
    }
    if (Array.isArray(payload.content)) {
      return payload.content
    }
    // fallback: return empty
    return []
}
