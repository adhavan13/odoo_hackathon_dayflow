import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export type UserRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  companyId?: string;
}

interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  switchRole: (role: UserRole) => void;
  loginWithBackend: (email: string, password: string) => Promise<UserProfile>;
  signupWithBackend: (data: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    logo?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
}

const normalizeRole = (roleStr: string): UserRole => {
  const upper = String(roleStr || '').toUpperCase();
  if (upper === 'ADMIN' || upper === 'HR') return 'admin';
  return 'employee';
};

const mockAdminUser: UserProfile = {
  id: 'usr_admin_01',
  name: 'Sarah Jenkins',
  email: 'sarah.j@company.com',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  department: 'Human Resources',
  designation: 'HR Officer / Admin',
};

const mockEmployeeUser: UserProfile = {
  id: 'usr_emp_02',
  name: 'Alex Rivera',
  email: 'alex.rivera@company.com',
  role: 'employee',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  department: 'Software Engineering',
  designation: 'Senior Frontend Developer',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: mockAdminUser,
  role: 'admin',
  token: 'mock_jwt_token_123',
  isAuthenticated: true,
  isLoading: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ user, token, role: user.role, isAuthenticated: true });
  },

  switchRole: (role) => {
    const newUser = role === 'admin' ? mockAdminUser : mockEmployeeUser;
    set({ role, user: newUser });
  },

  loginWithBackend: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const resData = response.data || response;
      const rawUser = resData.user;
      const token = resData.accessToken || resData.token;

      if (!rawUser || !token) {
        throw new Error(response.message || 'Invalid login response structure');
      }

      const mappedUser: UserProfile = {
        id: rawUser.id || rawUser._id || `usr_${Date.now()}`,
        name: rawUser.name || email.split('@')[0],
        email: rawUser.email,
        role: normalizeRole(rawUser.role),
        avatarUrl: rawUser.avatarUrl || rawUser.logo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: rawUser.department || (normalizeRole(rawUser.role) === 'admin' ? 'Human Resources' : 'Software Engineering'),
        designation: rawUser.designation || (normalizeRole(rawUser.role) === 'admin' ? 'HR Officer / Admin' : 'Senior Developer'),
        employeeId: rawUser.employeeId,
        companyId: rawUser.companyId,
      };

      get().setAuth(mappedUser, token);
      snackbar.success(`Welcome back, ${mappedUser.name}!`);
      return mappedUser;
    } catch (error: any) {
      const msg = error?.message || 'Login failed. Please check your credentials.';
      snackbar.error(msg);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signupWithBackend: async (signupData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/signup', signupData);
      const resData = response.data || response;
      const rawUser = resData.user;
      const token = resData.accessToken;

      const mappedUser: UserProfile = {
        id: rawUser?.id || `usr_${Date.now()}`,
        name: signupData.name,
        email: signupData.email,
        role: 'admin',
        avatarUrl: signupData.logo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: 'Executive Board / Admin',
        designation: 'Company Founder / HR Admin',
        companyId: resData.company?.id,
      };

      if (token) {
        get().setAuth(mappedUser, token);
      }

      snackbar.success(`Company "${signupData.companyName}" registered successfully!`);
      if (resData.verificationOtp) {
        snackbar.info(`Verification OTP: ${resData.verificationOtp}`);
      }
      return mappedUser;
    } catch (error: any) {
      const msg = error?.message || 'Registration failed. Please check company details.';
      snackbar.error(msg);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    set({ user: null, role: 'admin', token: null, isAuthenticated: false });
  },
}));
