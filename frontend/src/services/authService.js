const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

// helper to store token
export function setToken(token) {
    localStorage.setItem('noor-token', token);
}

// helper to get token
export function getToken() {
    return localStorage.getItem('noor-token');
}

// helper to remove token
export function clearToken() {
    localStorage.removeItem('noor-token');
}

export async function register({ name, email, password }) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) setToken(data.token);
    else throw data;
}

export async function login({ email, password }) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) setToken(data.token);
    else throw data;
}

export async function fetchMe() {
    const token = getToken();
    const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}
