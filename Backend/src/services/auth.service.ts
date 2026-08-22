import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { ApiError } from '../utils/apiError';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

const mockUsers: UserDTO[] = [
  {
    id: 'usr_admin_01',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Human Resources',
    designation: 'HR Officer / Admin',
  },
  {
    id: 'usr_emp_02',
    name: 'Alex Rivera',
    email: 'alex.rivera@company.com',
    role: 'employee',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Software Engineering',
    designation: 'Senior Frontend Developer',
  },
];

export class AuthService {
  static async login(email: string, role: 'admin' | 'employee') {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  static async getProfile(userId: string) {
    const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
    return user;
  }
}
