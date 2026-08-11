import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('sf_token'));

  const api = useCallback(async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then(data => {
        setUser(data.user);
        setBusiness(data.business);
        setSubscription(data.subscription);
      })
      .catch(() => {
        localStorage.removeItem('sf_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token, api]);

  const login = async (email, password, remember = false) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    });
    localStorage.setItem('sf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    setSubscription(data.subscription);
    return data;
  };

  const signup = async (userData) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('sf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    setSubscription(data.subscription);
    return data;
  };

  const logout = async () => {
    try {
      if (token) await api('/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('sf_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
    setSubscription(null);
  };

  const updateBusiness = (biz) => setBusiness(biz);
  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{
      user, business, subscription, loading, token,
      api, login, signup, logout, updateBusiness, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
