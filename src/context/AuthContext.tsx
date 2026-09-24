'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<User>;
  register: (data: { name: string; email: string; phone: string; role: UserRole }) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, role?: UserRole) => {
    setLoading(true);
    const loggedInUser = await authService.login(email, role);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const register = async (data: { name: string; email: string; phone: string; role: UserRole }) => {
    setLoading(true);
    const newUser = await authService.register(data);
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setLoading(false);
  };

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    const updated = await authService.login(`${role.toLowerCase()}@replate.org`, role);
    setUser(updated);
    setLoading(false);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
