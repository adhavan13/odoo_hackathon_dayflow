import { create } from 'zustand';

export type UserRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

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

export const useAuthStore = create<AuthState>((set) => ({
  user: mockAdminUser,
  role: 'admin',
  token: 'mock_jwt_token_123',
  isAuthenticated: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    set({ user, token, role: user.role, isAuthenticated: true });
  },

  switchRole: (role) => {
    const newUser = role === 'admin' ? mockAdminUser : mockEmployeeUser;
    set({ role, user: newUser });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    set({ user: null, role: 'admin', token: null, isAuthenticated: false });
  },
}));
