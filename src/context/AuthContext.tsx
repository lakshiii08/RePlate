'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<User>;
  register: (data: { name: string; email: string; phone: string; role: UserRole }) => Promise<User>;
  sendOtp: (identifier: string, role?: UserRole, name?: string) => Promise<{ success: boolean; message: string; sentTo?: string }>;
  verifyOtp: (
    identifier: string,
    otp: string,
    role?: UserRole,
    newUserData?: { name?: string; role?: UserRole; organization?: string }
  ) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<User>;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
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

  const sendOtp = async (identifier: string, role?: UserRole, name?: string) => {
    return authService.sendOtp(identifier, role, name);
  };

  const verifyOtp = async (
    identifier: string,
    otp: string,
    role?: UserRole,
    newUserData?: { name?: string; role?: UserRole; organization?: string }
  ) => {
    setLoading(true);
    try {
      const verifiedUser = await authService.verifyOtp(identifier, otp, role, newUserData);
      setUser(verifiedUser);
      return verifiedUser;
    } finally {
      setLoading(false);
    }
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

  const updateUserProfile = async (updates: Partial<User>) => {
    setLoading(true);
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    setLoading(false);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, sendOtp, verifyOtp, register, logout, switchRole, updateUserProfile }}
    >
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
