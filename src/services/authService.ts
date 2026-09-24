import { User, UserRole } from '@/types';

const MOCK_USERS: User[] = [
  {
    id: 'user-donor-1',
    name: 'Sarah Jenkins',
    email: 'donor@replate.org',
    phone: '+1 (555) 234-5678',
    role: 'DONOR',
    organization: 'Grand Hyatt Hotel Catering',
  },
  {
    id: 'user-shelter-1',
    name: 'Marcus Williams',
    email: 'shelter@replate.org',
    phone: '+1 (555) 876-5432',
    role: 'SHELTER',
    organization: 'Hope Community Shelter',
  },
  {
    id: 'user-driver-1',
    name: 'Aarav Patel',
    email: 'driver@replate.org',
    phone: '+1 (555) 111-2233',
    role: 'DRIVER',
    organization: 'Independent Rescue Volunteer',
  },
  {
    id: 'user-admin-1',
    name: 'Elena Rostova',
    email: 'admin@replate.org',
    phone: '+1 (555) 999-0000',
    role: 'ADMIN',
    organization: 'RePlate Operations Command',
  },
];

export const authService = {
  async login(email: string, role?: UserRole): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Find matching user or fallback to role preset
    let found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found && role) {
      found = MOCK_USERS.find((u) => u.role === role);
    }
    
    if (!found) {
      // Fallback to role-matching profile or first mock user
      found = role ? MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0] : MOCK_USERS[0];
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      organization: `${data.role} Partner Org`,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('replate_session', JSON.stringify(newUser));
    }
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('replate_session');
    if (!session) {
      return null; // Return null when unauthenticated
    }
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('replate_session');
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`Password reset email triggered for ${email}`);
    return true;
  },
};
