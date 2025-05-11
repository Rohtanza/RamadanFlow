// src/services/authService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const setToken = (token) => {
    if (!token) {
        clearToken();
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const setUser = (userData) => {
    if (!userData) {
        localStorage.removeItem(USER_KEY);
        return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUser = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const clearUser = () => {
    localStorage.removeItem(USER_KEY);
};

export async function register({ name, email, password, captcha }) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, captcha })
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
        return data;
    }
    throw new Error(data.error || 'Registration failed');
}

export async function login({ email, password, captcha }) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha })
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
        return data;
    }
    throw new Error(data.error || 'Login failed');
}

export const googleLogin = async (credential) => {
    try {
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: credential }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.details || 'Login failed');
        }

        if (data.token) {
            setToken(data.token);
        }
        return data;
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
};

export async function fetchMe() {
    const token = getToken();
    if (!token) {
        console.log('No token found in fetchMe');
        return null;
    }

    try {
        console.log('Fetching user data with token');
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('Token expired or invalid');
                clearToken();
            }
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch user');
        }
        
        const userData = await response.json();
        console.log('User data fetched successfully:', userData);
        setUser(userData);
        return userData;
    } catch (error) {
        console.error('Fetch user error:', error);
        clearToken();
        throw error;
    }
}

export async function verifyToken() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            clearToken();
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error('Token verification error:', err);
        clearToken();
        return null;
    }
}

export async function updateProfile(profileData) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function fetchUserActivity() {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/auth/activity`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

