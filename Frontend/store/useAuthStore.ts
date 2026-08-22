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
  logo?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  companyId?: string;
  companyName?: string;

  joinDate?: string;
  dateOfJoining?: string;
  status?: string;
  phone?: string;
  mobile?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  residingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  nationality?: string;
  personalEmail?: string;
  emergencyContact?: string;
  manager?: string;
  location?: string;
  about?: string;
  whatILove?: string;
  interests?: string;
  skills?: string[];
  certifications?: string[];

  bankName?: string;
  accountNumber?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panNo?: string;
  aadhaarNo?: string;
  uanNo?: string;
  empCode?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    panNo?: string;
    aadhaarNo?: string;
    uanNo?: string;
  };
  monthlyWage?: number | string;
  workingDaysPerWeek?: number | string;
  breakTimeHours?: number | string;
  pfRate?: number | string;
  profTax?: number | string;
}

export interface SignupResult {
  user: UserProfile;
  verificationOtp?: string;
  accessToken?: string;
}

interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: UserProfile, token: string) => void;
  switchRole: (role: UserRole) => void;

  checkAuthMe: () => Promise<void>;
  loginWithBackend: (email: string, pass: string) => Promise<UserProfile>;
  signupWithBackend: (data: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    logo?: string;
  }) => Promise<SignupResult>;
  sendOtpWithBackend: (email: string) => Promise<string | undefined>;
  verifyOtpWithBackend: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const mockAdminUser: UserProfile = {
  id: 'usr_admin_01',
  name: 'Sarah Jenkins',
  email: 'sarah.j@company.com',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  logo: '/logo.png',
  department: 'Human Resources',
  designation: 'HR Officer / Admin',
  employeeId: 'EMP1002',
};

const mockEmployeeUser: UserProfile = {
  id: 'usr_emp_02',
  name: 'Alex Rivera',
  email: 'alex.rivera@company.com',
  role: 'employee',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  logo: '/logo.png',
  department: 'Software Engineering',
  designation: 'Senior Frontend Developer',
  employeeId: 'EMP1001',
};

const getStoredAuth = (): { user: UserProfile | null; role: UserRole; token: string | null; isAuthenticated: boolean } => {
  if (typeof window === 'undefined') {
    return { user: null, role: 'admin', token: null, isAuthenticated: false };
  }
  const token = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');

  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      return {
        user: parsedUser,
        role: parsedUser.role || 'admin',
        token,
        isAuthenticated: true,
      };
    } catch {
      // Fallback
    }
  }
  return { user: null, role: 'admin', token: null, isAuthenticated: false };
};

const normalizeRole = (backendRole?: string): UserRole => {
  if (!backendRole) return 'employee';
  const upper = backendRole.toUpperCase();
  if (upper === 'ADMIN' || upper === 'HR') return 'admin';
  return 'employee';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getStoredAuth(),
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

  checkAuthMe: async () => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) return;

    try {
      const response = await api.get('/auth/me');
      const rawUser = response.data?.user || response.data;
      if (rawUser && rawUser.email) {
        const logoUrl = rawUser.logo || rawUser.avatarUrl || '/logo.png';
        const mappedUser: UserProfile = {
          id: rawUser.id || rawUser._id || 'usr_01',
          name: rawUser.name || rawUser.email.split('@')[0],
          email: rawUser.email,
          role: normalizeRole(rawUser.role),
          avatarUrl: logoUrl,
          logo: logoUrl,
          department: rawUser.department || (normalizeRole(rawUser.role) === 'admin' ? 'Human Resources' : 'Software Engineering'),
          designation: rawUser.designation || (normalizeRole(rawUser.role) === 'admin' ? 'HR Officer / Admin' : 'Senior Developer'),
          employeeId: rawUser.employeeId,
          companyId: rawUser.companyId,
          companyName: rawUser.companyName || rawUser.company?.name,
        };
        get().setAuth(mappedUser, storedToken);
      }
    } catch (err) {
      // Keep existing stored user on network error
    }
  },

  loginWithBackend: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const resData = response.data || response;
      const rawUser = resData.user;
      const token = resData.accessToken;

      if (!rawUser || !token) {
        throw new Error('Invalid response structure from backend.');
      }

      const logoUrl = rawUser.logo || rawUser.avatarUrl || '/logo.png';
      const mappedUser: UserProfile = {
        id: rawUser.id || rawUser._id || `usr_${Date.now()}`,
        name: rawUser.name || email.split('@')[0],
        email: rawUser.email,
        role: normalizeRole(rawUser.role),
        avatarUrl: logoUrl,
        logo: logoUrl,
        department: rawUser.department || (normalizeRole(rawUser.role) === 'admin' ? 'Human Resources' : 'Software Engineering'),
        designation: rawUser.designation || (normalizeRole(rawUser.role) === 'admin' ? 'HR Officer / Admin' : 'Senior Developer'),
        employeeId: rawUser.employeeId,
        companyId: rawUser.companyId,
        companyName: rawUser.companyName || rawUser.company?.name,
      };

      get().setAuth(mappedUser, token);
      snackbar.success(`Welcome back, ${mappedUser.name}!`);
      return mappedUser;
    } catch (error: any) {
      const msg = error?.message || 'Login failed. Please check credentials.';
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

      const logoUrl = signupData.logo || '/logo.png';
      const mappedUser: UserProfile = {
        id: rawUser?.id || `usr_${Date.now()}`,
        name: signupData.name,
        email: signupData.email,
        role: 'admin',
        avatarUrl: logoUrl,
        logo: logoUrl,
        department: 'Executive Board / Admin',
        designation: 'Company Founder / HR Admin',
        companyId: resData.company?.id,
        companyName: signupData.companyName || resData.company?.name,
      };

      snackbar.success(`Organization "${signupData.companyName}" registered! Verification OTP sent to email.`);
      
      return {
        user: mappedUser,
        verificationOtp: resData.verificationOtp,
        accessToken: token,
      };
    } catch (error: any) {
      const msg = error?.message || 'Registration failed. Please check company details.';
      snackbar.error(msg);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendOtpWithBackend: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/send-verification-otp', { email });
      const resData = response.data || response;
      snackbar.success(`Verification OTP resent to ${email}`);
      return resData.verificationOtp;
    } catch (error: any) {
      snackbar.error(error?.message || 'Failed to send OTP');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOtpWithBackend: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      const resData = response.data || response;
      const rawUser = resData.user;
      const token = resData.accessToken;

      if (rawUser && token) {
        const logoUrl = rawUser.logo || rawUser.avatarUrl || '/logo.png';
        const mappedUser: UserProfile = {
          id: rawUser.id || rawUser._id || `usr_${Date.now()}`,
          name: rawUser.name || email.split('@')[0],
          email: rawUser.email,
          role: 'admin',
          avatarUrl: logoUrl,
          logo: logoUrl,
          department: 'Executive Board / Admin',
          designation: 'Company Founder / HR Admin',
          companyId: resData.company?.id,
          companyName: resData.company?.name,
        };

        get().setAuth(mappedUser, token);
      }

      snackbar.success('Email verified successfully! Organization registered in database.');
      return true;
    } catch (error: any) {
      snackbar.error(error?.message || 'Invalid or expired OTP. Please try again.');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors during logout
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    set({ user: null, role: 'admin', token: null, isAuthenticated: false });
  },
}));
