import { createContext, useContext, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);
const STORAGE_KEY = 'webazi_admin_token';

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));

  const login = useCallback((newToken) => {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  const handleAuthError = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <AdminAuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout, handleAuthError }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
