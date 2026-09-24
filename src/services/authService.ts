import { User, UserRole } from '@/types';
import { apiClient } from './apiClient';

const MOCK_USERS: User[] = [
  {
    id: 'user-donor-1',
    name: 'Sarah Jenkins',
    email: 'donor@replate.org',
    phone: '+1 (555) 234-5678',
    role: 'DONOR',
    organization: 'Grand Hyatt Hotel Catering',
    ownerName: 'Sarah Jenkins (General Manager)',
    address: '345 Embarcadero Plaza, Financial District, SF, CA 94111',
    operatingHours: 'Mon - Sun: 06:30 AM - 11:30 PM',
  },
  {
    id: 'user-shelter-1',
    name: 'Marcus Williams',
    email: 'shelter@replate.org',
    phone: '+1 (555) 876-5432',
    role: 'SHELTER',
    organization: 'Hope Community Shelter & Kitchen',
  },
  {
    id: 'user-driver-1',
    name: 'Aarav Patel',
    email: 'driver@replate.org',
    phone: '+1 (555) 111-2233',
    role: 'DRIVER',
    organization: 'Refrigerated Transport Volunteer',
  },
  {
    id: 'user-admin-1',
    name: 'Operations Dispatch Admin',
    email: 'admin@replate.org',
    phone: '+1 (555) 999-0000',
    role: 'ADMIN',
    organization: 'RePlate Regional Command',
  },
];

export const authService = {
  async login(email: string, role?: UserRole): Promise<User> {
    const apiRes = await apiClient.post<User>('/auth/login', { email, role });
    let found: User | null = apiRes.data;

    if (!found) {
      found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
      if (!found && role) {
        found = MOCK_USERS.find((u) => u.role === role) || null;
      }
      if (!found) {
        found = MOCK_USERS[0];
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(found));
    }

    return found;
  },

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; demoOtp: string }> {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const apiRes = await apiClient.post<{ success: boolean; message: string; demoOtp: string }>('/auth/send-otp', {
      phone: cleanPhone,
    });

    if (apiRes.data) {
      return apiRes.data;
    }

    // Client fallback
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`replate_otp_${cleanPhone}`, generatedOtp);
    }
    return {
      success: true,
      message: `OTP sent successfully to ${cleanPhone}`,
      demoOtp: generatedOtp,
    };
  },

  async verifyOtp(
    phone: string,
    otp: string,
    role?: UserRole,
    newUserData?: { name?: string; role?: UserRole; organization?: string }
  ): Promise<User> {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const apiRes = await apiClient.post<{ user: User; token?: string }>('/auth/verify-otp', {
      phone: cleanPhone,
      otp,
      role,
      newUserData,
    });

    let found: User | null = apiRes.data?.user || null;

    if (!found) {
      // Local fallback
      const storedOtp = typeof window !== 'undefined' ? sessionStorage.getItem(`replate_otp_${cleanPhone}`) : null;
      // Allow entered OTP if it matches stored or default demo 8492 or 1234
      const isValid = otp === storedOtp || otp === '8492' || otp === '1234';
      if (!isValid && storedOtp) {
        throw new Error('Invalid OTP. Please check the code and try again.');
      }

      // Check if user with phone exists
      found = MOCK_USERS.find((u) => u.phone.replace(/[^\d+]/g, '') === cleanPhone) || null;

      if (!found) {
        // Create new user on the fly
        const userRole = newUserData?.role || role || 'DONOR';
        found = {
          id: `user-${Date.now()}`,
          name: newUserData?.name || (userRole === 'DONOR' ? 'New Food Donor' : userRole === 'SHELTER' ? 'Community Shelter Admin' : 'Volunteer Driver'),
          email: `${cleanPhone.slice(-4)}@replate.org`,
          phone: cleanPhone,
          role: userRole,
          organization: newUserData?.organization || (userRole === 'DONOR' ? 'Fresh Food Partner' : userRole === 'SHELTER' ? 'City Food Rescue Pantry' : 'Urban Delivery Volunteer'),
          status: 'ACTIVE',
        };
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(found));
    }

    return found;
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
  }): Promise<User> {
    const apiRes = await apiClient.post<User>('/auth/register', data);
    let newUser: User | null = apiRes.data;

    if (!newUser) {
      newUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        organization: `${data.role} Partner Org`,
      };
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
    const updated: User = {
      ...(current || MOCK_USERS[0]),
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
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`Password reset notification triggered for ${email}`);
    return true;
  },
};
