import { getToken } from './authService';

const API = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

const authHeaders = (contentType = false) => {
  const token = getToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Ramadan Goals
export const fetchGoals = async () => {
  try {
    const res = await fetch(`${API}/ramadan-goals`, {
      method: 'GET',
      headers: authHeaders(),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch goals');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const createGoal = async (goal) => {
  try {
    const res = await fetch(`${API}/ramadan-goals`, {
      method: 'POST',
      headers: authHeaders(true),
      credentials: 'include',
      body: JSON.stringify(goal)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create goal');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoalStatus = async (goalId, status) => {
  try {
    const res = await fetch(`${API}/ramadan-goals/${goalId}`, {
      method: 'PATCH',
      headers: authHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update goal status');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const res = await fetch(`${API}/ramadan-goals/${goalId}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete goal');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Reflections
export const fetchReflections = async () => {
  try {
    const res = await fetch(`${API}/reflections`, {
      method: 'GET',
      headers: authHeaders(),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch reflections');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching reflections:', error);
    throw error;
  }
};

export const createReflection = async (reflection) => {
  try {
    const res = await fetch(`${API}/reflections`, {
      method: 'POST',
      headers: authHeaders(true),
      credentials: 'include',
      body: JSON.stringify(reflection)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create reflection');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error creating reflection:', error);
    throw error;
  }
};

export const deleteReflection = async (reflectionId) => {
  try {
    const res = await fetch(`${API}/reflections/${reflectionId}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete reflection');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error deleting reflection:', error);
    throw error;
  }
}; 