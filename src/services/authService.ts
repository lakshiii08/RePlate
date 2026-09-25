import { User, UserRole } from '@/types';
import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, role?: UserRole): Promise<User> {
    const apiRes = await apiClient.post<User>('/auth/login', { email, role });
    const found: User | null = apiRes.data;

    if (!found || apiRes.status >= 400) {
      throw new Error(apiRes.message || 'Account not found. Please sign up or sign in using Email OTP.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(found));
    }

    return found;
  },

  async sendOtp(
    identifier: string,
    role?: UserRole,
    name?: string
  ): Promise<{ success: boolean; message: string; sentTo?: string }> {
    const isEmail = identifier.includes('@');
    const cleanPhone = identifier.replace(/[^\d+]/g, '');

    const apiRes = await apiClient.post<{ success: boolean; message?: string; error?: string; sentTo?: string }>(
      '/auth/send-otp',
      {
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? cleanPhone : undefined,
        role,
        name,
      }
    );

    if (apiRes.status >= 400 || (apiRes.data && !apiRes.data.success)) {
      const errMsg = apiRes.data?.error || apiRes.message || 'Failed to deliver verification code. Please check your email.';
      throw new Error(errMsg);
    }

    const recipient = apiRes.data?.sentTo || identifier;
    return {
      success: true,
      message: apiRes.data?.message || `Verification code sent to ${recipient}.`,
      sentTo: recipient,
    };
  },

  async verifyOtp(
    identifier: string,
    otp: string,
    role?: UserRole,
    newUserData?: { name?: string; role?: UserRole; organization?: string; phone?: string }
  ): Promise<User> {
    const isEmail = identifier.includes('@');
    const cleanPhone = identifier.replace(/[^\d+]/g, '');

    const apiRes = await apiClient.post<{ success: boolean; user?: User; token?: string; error?: string }>(
      '/auth/verify-otp',
      {
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? cleanPhone : undefined,
        otp: otp.trim(),
        role,
        newUserData,
      }
    );

    if (apiRes.status >= 400 || (apiRes.data && apiRes.data.success === false) || !apiRes.data?.user) {
      const errMsg = apiRes.data?.error || apiRes.message || 'Invalid or expired verification code. Please check your email.';
      throw new Error(errMsg);
    }

    const user: User = apiRes.data.user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(user));
      if (apiRes.data.token) {
        localStorage.setItem('replate_auth_token', apiRes.data.token);
      }
    }

    return user;
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    organization?: string;
  }): Promise<User> {
    const apiRes = await apiClient.post<User>('/auth/register', data);
    const newUser: User | null = apiRes.data;

    if (!newUser || apiRes.status >= 400) {
      throw new Error(apiRes.message || 'Failed to complete registration.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(newUser));
    }
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('replate_session');
    if (!session) {
      return null;
    }
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = await this.getCurrentUser();
    if (!current) {
      throw new Error('No active user session to update.');
    }
    const updated: User = {
      ...current,
      ...updates,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(updated));
    }
    return updated;
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('replate_session');
      localStorage.removeItem('replate_auth_token');
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    await this.sendOtp(email);
    return true;
  },
};
