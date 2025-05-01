import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, clearToken, fetchMe } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on mount, load user if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchMe()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (creds) => {
    await import('../services/authService').then(m => m.login(creds));
    const me = await fetchMe();
    setUser(me);
  };

  const registerUser = async (creds) => {
    await import('../services/authService').then(m => m.register(creds));
    const me = await fetchMe();
    setUser(me);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
