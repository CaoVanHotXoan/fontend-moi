import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { safeStorage } from '@/utils/storage';
import { useToast } from '@/context/ToastContext';

export type UserProfile = {
  id?: number;
  roleId?: number;
  role?: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
};

export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  status: AsyncState;
  error: string | null;
  loginUser: (token: string, user: UserProfile) => void;
  logoutUser: () => void;
  updateProfileState: (updatedProfile: UserProfile) => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  status: 'idle',
  error: null,
  loginUser: () => {},
  logoutUser: () => {},
  updateProfileState: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Domain Rehydration on client initial mount (F5 safe, SSR safe, corrupt data recovery)
  useEffect(() => {
    try {
      setStatus('loading');
      const storedToken = safeStorage.getItem<string | null>('token', null);
      const storedProfile = safeStorage.getItem<UserProfile | null>('profile', null);
      
      if (storedToken && storedProfile) {
        setToken(storedToken);
        setUser(storedProfile);
        setStatus('success');
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error('[AuthDomain] Error rehydrating state:', e);
      setError('Lỗi khôi phục phiên đăng nhập.');
      setStatus('error');
    }
  }, []);

  const loginUser = useCallback((newToken: string, newUser: UserProfile) => {
    setStatus('loading');
    try {
      setToken(newToken);
      setUser(newUser);
      setError(null);
      safeStorage.setItem('auth', 'true');
      safeStorage.setItem('token', newToken);
      safeStorage.setItem('profile', newUser);
      setStatus('success');
      addToast('Đăng nhập thành công', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      setStatus('error');
      addToast('Đăng nhập thất bại', 'error');
    }
  }, [addToast]);

  const logoutUser = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    setStatus('idle');
    // Wipe client storage completely on logout
    safeStorage.clearAll();
    addToast('Đã đăng xuất', 'success');
  }, [addToast]);

  const updateProfileState = useCallback((updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    safeStorage.setItem('profile', updatedProfile);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user?.role?.toLowerCase() === 'admin' || user?.roleId === 1 || user?.username?.toLowerCase() === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        status,
        error,
        loginUser,
        logoutUser,
        updateProfileState,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
