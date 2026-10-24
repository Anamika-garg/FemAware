import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearToken, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('cyclesense:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cyclesense:unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const completeOnboarding = useCallback(async (payload) => {
    const { data } = await api.post('/auth/onboarding', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.patch('/auth/profile', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      completeOnboarding,
      updateProfile,
      setUser,
    }),
    [user, loading, login, register, logout, refreshUser, completeOnboarding, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
