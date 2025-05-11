// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, clearToken, setUser as setStoredUser, getUser as getStoredUser } from '../services/authService';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { addNotification } = useNotification();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyAndSetUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await fetchMe();
      if (userData) {
        console.log('Setting user data from token:', userData);
        setUser(userData);
        setStoredUser(userData);
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verify user on mount and when token changes
  useEffect(() => {
    verifyAndSetUser();
  }, []);

  const fetchMe = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          throw new Error('Session expired');
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        } else {
          throw new Error('Server error');
        }
      }

      const data = await response.json();
      console.log('Fetched user data:', data);
      setUser(data);
      setStoredUser(data);
      setError(null);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.message.includes('Token expired') || 
          error.message.includes('Invalid token') || 
          error.message.includes('Session expired')) {
        clearToken();
      }
      setUser(null);
      setError(error.message);
      throw error;
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      const userData = await fetchMe();
      setUser(userData);
      setError(null);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const registerUser = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      const userData = await fetchMe();
      setUser(userData);
      setError(null);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const googleLoginUser = async (credential) => {
    try {
      console.log('Sending Google credential to backend:', credential);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token: credential })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google login error response:', errorData);
        throw new Error(errorData.error || 'Google login failed');
      }

      const data = await response.json();
      console.log('Google login response:', data);

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      setToken(data.token);
      setUser(data.user);
      setStoredUser(data.user);
      setError(null);
      
      // Verify the user data was set correctly
      await verifyAndSetUser();
      
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setError(null);
    addNotification('Successfully logged out', 'info');
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data);
      addNotification('Profile updated successfully', 'success');
      return data;
    } catch (error) {
      setError(error.message);
      addNotification(error.message, 'error');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    loginUser,
    registerUser,
    googleLoginUser,
    logout,
    fetchMe,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

