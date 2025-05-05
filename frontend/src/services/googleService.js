// src/services/googleService.js
import { setToken } from './authService';

const API = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

/**
 * Send Google credential to our backend and store returned JWT.
 * @param {string} credential - The Google ID token (credentialResponse.credential)
 * @returns {Promise<string>} The JWT issued by our backend.
 */
export async function loginWithGoogle(credential) {
  const res = await fetch(`${API}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ credential })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errors?.[0]?.msg || data.msg || 'Google login failed');
  }

  // store JWT for subsequent requests
  setToken(data.token);
  return data.token;
}
