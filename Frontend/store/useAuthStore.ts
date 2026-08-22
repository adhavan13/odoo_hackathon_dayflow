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
  phone?: string;
  mobile?: string;
  manager?: string;
  location?: string;
  about?: string;
  whatILove?: string;
  interests?: string;
  skills?: string[];
  certifications?: string[];
  dob?: string;
  residingAddress?: string;
  address?: string;
  nationality?: string;
  personalEmail?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfJoining?: string;
  joinDate?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  panNo?: string;
  uanNo?: string;
  empCode?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    panNo?: string;
    uanNo?: string;
  };
  [key: string]: any;
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
      window.dispatchEvent(new Event('auth_user_updated'));
    }
    set({ user, token, role: user.role, isAuthenticated: true });
  },

  switchRole: (role) => {
    const newUser = role === 'admin' ? mockAdminUser : mockEmployeeUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth_user_updated'));
    }
    set({ role, user: newUser });
  },

  checkAuthMe: async () => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('auth_token');
    const storedUserRaw = localStorage.getItem('auth_user');
    let existingUser: UserProfile | null = null;
    if (storedUserRaw) {
      try {
        existingUser = JSON.parse(storedUserRaw);
      } catch {
        existingUser = null;
      }
    }

    if (!storedToken) return;

    try {
      const response = await api.get('/auth/me');
      const rawUser = response.data?.user || response.data;
      if (rawUser && (rawUser.email || rawUser.id)) {
        const logoUrl =
          rawUser.avatarUrl ||
          rawUser.profileImage ||
          rawUser.avatar ||
          rawUser.logo ||
          existingUser?.avatarUrl ||
          '/user.png';
        const userRole = normalizeRole(rawUser.role || existingUser?.role);
        const mappedUser: UserProfile = {
          ...existingUser,
          ...rawUser,
          id: rawUser.id || rawUser._id || existingUser?.id || `usr_${Date.now()}`,
          name: rawUser.name || existingUser?.name || rawUser.email?.split('@')[0] || 'User',
          email: rawUser.email || existingUser?.email || '',
          role: userRole,
          avatarUrl: logoUrl,
          logo: logoUrl,
          department:
            rawUser.department ||
            existingUser?.department ||
            (userRole === 'admin' ? 'Human Resources' : 'Software Engineering'),
          designation:
            rawUser.designation ||
            existingUser?.designation ||
            (userRole === 'admin' ? 'HR Officer / Admin' : 'Senior Developer'),
          employeeId:
            rawUser.employeeId ||
            rawUser.empCode ||
            rawUser.code ||
            existingUser?.employeeId ||
            (userRole === 'admin' ? 'EMP1002' : 'EMP1001'),
          companyId: rawUser.companyId || existingUser?.companyId,
          companyName: rawUser.companyName || rawUser.company?.name || existingUser?.companyName || 'Dayflow HRMS',
          phone: rawUser.phone || rawUser.mobile || existingUser?.phone || existingUser?.mobile,
          mobile: rawUser.mobile || rawUser.phone || existingUser?.mobile || existingUser?.phone,
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

      const logoUrl =
        rawUser.avatarUrl ||
        rawUser.profileImage ||
        rawUser.avatar ||
        rawUser.logo ||
        '/user.png';
      const userRole = normalizeRole(rawUser.role);
      const mappedUser: UserProfile = {
        ...rawUser,
        id: rawUser.id || rawUser._id || `usr_${Date.now()}`,
        name: rawUser.name || email.split('@')[0],
        email: rawUser.email || email,
        role: userRole,
        avatarUrl: logoUrl,
        logo: logoUrl,
        department:
          rawUser.department || (userRole === 'admin' ? 'Human Resources' : 'Software Engineering'),
        designation:
          rawUser.designation || (userRole === 'admin' ? 'HR Officer / Admin' : 'Senior Developer'),
        employeeId:
          rawUser.employeeId || rawUser.empCode || rawUser.code || (userRole === 'admin' ? 'EMP1002' : 'EMP1001'),
        companyId: rawUser.companyId,
        companyName: rawUser.companyName || rawUser.company?.name || 'Dayflow HRMS',
        phone: rawUser.phone || rawUser.mobile,
        mobile: rawUser.mobile || rawUser.phone,
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

      const logoUrl = signupData.logo || '/user.png';
      const mappedUser: UserProfile = {
        id: rawUser?.id || `usr_${Date.now()}`,
        name: signupData.name,
        email: signupData.email,
        role: 'admin',
        avatarUrl: logoUrl,
        logo: logoUrl,
        department: 'Executive Board / Admin',
        designation: 'Company Founder / HR Admin',
        employeeId: rawUser?.employeeId || rawUser?.empCode || 'EMP1002',
        companyId: resData.company?.id,
        companyName: signupData.companyName || resData.company?.name || 'Dayflow HRMS',
        phone: signupData.phone,
      };

      if (token) {
        get().setAuth(mappedUser, token);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(mappedUser));
          window.dispatchEvent(new Event('auth_user_updated'));
        }
      }

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

      let storedSignupUser: UserProfile | null = null;
      if (typeof window !== 'undefined') {
        const rawStored = localStorage.getItem('auth_user');
        if (rawStored) {
          try { storedSignupUser = JSON.parse(rawStored); } catch {}
        }
      }

      const logoUrl = rawUser?.avatarUrl || rawUser?.logo || storedSignupUser?.avatarUrl || '/user.png';
      const mappedUser: UserProfile = {
        ...storedSignupUser,
        ...rawUser,
        id: rawUser?.id || rawUser?._id || storedSignupUser?.id || `usr_${Date.now()}`,
        name: rawUser?.name || storedSignupUser?.name || email.split('@')[0],
        email: rawUser?.email || storedSignupUser?.email || email,
        role: 'admin',
        avatarUrl: logoUrl,
        logo: logoUrl,
        department: rawUser?.department || storedSignupUser?.department || 'Executive Board / Admin',
        designation: rawUser?.designation || storedSignupUser?.designation || 'Company Founder / HR Admin',
        employeeId: rawUser?.employeeId || rawUser?.empCode || storedSignupUser?.employeeId || 'EMP1002',
        companyId: resData.company?.id || storedSignupUser?.companyId,
        companyName: resData.company?.name || storedSignupUser?.companyName || 'Dayflow HRMS',
        phone: rawUser?.phone || storedSignupUser?.phone,
      };

      const finalToken = token || localStorage.getItem('auth_token') || 'verified_token';
      get().setAuth(mappedUser, finalToken);

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
      window.dispatchEvent(new Event('auth_user_updated'));
    }
    set({ user: null, role: 'admin', token: null, isAuthenticated: false });
  },
}));
