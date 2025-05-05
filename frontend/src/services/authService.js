// src/services/authService.js

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = BASE.replace(/\/$/, '') + '/auth';

export function setToken(token) {
    localStorage.setItem('noor-token', token);
}

export function getToken() {
    return localStorage.getItem('noor-token');
}

export function clearToken() {
    localStorage.removeItem('noor-token');
}

export async function register({ name, email, password, captcha }) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, captcha })
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
    } else {
        throw data;
    }
}

export async function login({ email, password, captcha }) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha })
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
    } else {
        throw data;
    }
}

export async function googleLogin(idToken) {
    const res = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
    } else {
        throw data;
    }
}

export async function fetchMe() {
    const token = getToken();
    const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        throw await res.json();
    }
    return res.json();
}
