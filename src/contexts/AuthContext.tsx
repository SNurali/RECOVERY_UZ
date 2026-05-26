import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

export type Role = 'admin' | 'operator' | 'master' | 'client' | null;

export interface User {
  id: string;
  full_name: string;
  role: Role;
  email: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/users/me');
        const userData = {
          id: data.id || data.data?.id,
          full_name: data.full_name || data.data?.full_name,
          role: (data.role?.name_eng || data.data?.role?.name_eng || data.role) as Role,
          email: data.email || data.data?.email,
          phone: data.phone || data.data?.phone,
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } catch (error) {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (loginStr: string, password: string) => {
    const response = await api.post('/auth/login', { login: loginStr, password });
    const payload = response.data?.data || response.data;
    const u = payload.user;
    const userData = {
      id: u.id,
      full_name: u.full_name,
      role: (u.role?.name_eng || u.role) as Role,
      email: u.email,
      phone: u.phone,
    };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    if (payload.token) {
      localStorage.setItem('auth_token', payload.token);
    }
    
    // Redirect based on role
    if (userData.role === 'client') {
      window.location.href = '/client';
    } else {
      window.location.href = '/staff';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout API errors
    }
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
