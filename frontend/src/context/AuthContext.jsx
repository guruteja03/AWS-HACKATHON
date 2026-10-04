import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cloudshare-demo-token') || '');
  const [user, setUser] = useState(() => {
    const fallback = localStorage.getItem('cloudshare-demo-user');
    try {
      return fallback ? JSON.parse(fallback) : null;
    } catch {
      localStorage.removeItem('cloudshare-demo-user');
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('cloudshare-demo-token', token);
    } else {
      localStorage.removeItem('cloudshare-demo-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cloudshare-demo-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cloudshare-demo-user');
    }
  }, [user]);

  const login = async (email, password) => {
    const response = await api.post('/auth/demo-login', { email, password });
    const authData = response.data.data;
    localStorage.setItem('cloudshare-demo-token', authData.token);
    localStorage.setItem('cloudshare-demo-user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('cloudshare-demo-token');
    localStorage.removeItem('cloudshare-demo-user');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
