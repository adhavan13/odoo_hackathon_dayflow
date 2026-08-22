import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { ApiError } from '../utils/apiError';
import { getDatabase } from '../config/database';

export interface UserDTO {
  id: string;
  employeeId: string;
  email: string;
  role: 'HR' | 'EMPLOYEE';
  name?: string;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

interface StoredUser extends UserDTO {
  username?: string;
  passwordHash: string;
  emailVerified: boolean;
  status: 'active' | 'inactive';
  verificationToken?: string;
  verificationTokenExpiresAt?: number;
  resetToken?: string;
  resetTokenExpiresAt?: number;
}

const seedUsers: StoredUser[] = [
  {
    id: 'usr_admin_01',
    employeeId: 'EMP1002',
    email: 'sarah.j@company.com',
    role: 'HR',
    name: 'Sarah Jenkins',
    passwordHash: bcrypt.hashSync('StrongPassword123!', 10),
    emailVerified: true,
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Human Resources',
    designation: 'HR Officer / Admin',
  },
  {
    id: 'usr_emp_02',
    employeeId: 'EMP1001',
    email: 'alex.rivera@company.com',
    role: 'EMPLOYEE',
    name: 'Alex Rivera',
    passwordHash: bcrypt.hashSync('StrongPassword123!', 10),
    emailVerified: true,
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Software Engineering',
    designation: 'Senior Frontend Developer',
  },
];

const publicUser = ({ passwordHash, username, verificationToken, verificationTokenExpiresAt, resetToken, resetTokenExpiresAt, ...user }: StoredUser): UserDTO => user;

const getUsers = () => getDatabase().collection<StoredUser>('users');

const ensureSeedUsers = async () => {
  const collection = getUsers();
  if (await collection.countDocuments() === 0) await collection.insertMany(seedUsers);
};

const validatePassword = (password: string) => {
  if (typeof password !== 'string' || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(400, 'Password must be at least 8 characters and include uppercase, lowercase, and a number.');
  }
};

const createToken = (user: UserDTO) => jwt.sign(
  { id: user.id, employeeId: user.employeeId, email: user.email, role: user.role, name: user.name },
  config.jwtSecret,
  { expiresIn: '7d' }
);

export class AuthService {
  static async signup(employeeId: string, email: string, password: string, role: 'EMPLOYEE' | 'HR') {
    if (!/^EMP[-]?\d{3,}$/i.test(employeeId)) throw new ApiError(400, 'Invalid employee ID.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Invalid email address.');
    if (role !== 'EMPLOYEE' && role !== 'HR') throw new ApiError(400, 'Role must be EMPLOYEE or HR.');
    validatePassword(password);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    await ensureSeedUsers();
    const collection = getUsers();
    if (await collection.findOne({ employeeId: normalizedEmployeeId })) throw new ApiError(409, 'Employee ID is already registered.');
    if (await collection.findOne({ email: normalizedEmail })) throw new ApiError(409, 'Email is already registered.');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user: StoredUser = {
      id: crypto.randomUUID(), employeeId: normalizedEmployeeId, email: normalizedEmail, username: normalizedEmail, role,
      passwordHash: await bcrypt.hash(password, 10), emailVerified: false, status: 'active',
      verificationToken, verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    await collection.insertOne(user);
    console.info(`[auth] Verification token for ${normalizedEmail}: ${verificationToken}`);
    return { user: publicUser(user), verificationToken };
  }

  static async verifyEmail(token: string) {
    const collection = getUsers();
    const user = await collection.findOne({ verificationToken: token });
    if (!user || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < Date.now()) throw new ApiError(400, 'Invalid or expired verification token.');
    await collection.updateOne({ id: user.id }, { $set: { emailVerified: true }, $unset: { verificationToken: '', verificationTokenExpiresAt: '' } });
  }

  static async login(email: string, password: string) {
    if (typeof email !== 'string' || typeof password !== 'string') throw new ApiError(401, 'Invalid email or password.');
    await ensureSeedUsers();
    const user = await getUsers().findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password.');
    if (!user.emailVerified) throw new ApiError(403, 'Please verify your email before logging in.');
    if (user.status !== 'active') throw new ApiError(403, 'Your account is inactive.');
    const safeUser = publicUser(user);
    const accessToken = createToken(safeUser);
    return { user: safeUser, accessToken };
  }

  static async getProfile(userId: string) {
    const user = await getUsers().findOne({ id: userId });
    if (!user) throw new ApiError(404, 'User not found.');
    return publicUser(user);
  }

  static async forgotPassword(email: string) {
    if (typeof email !== 'string') return;
    const collection = getUsers();
    const user = await collection.findOne({ email: email.trim().toLowerCase() });
    if (!user) return;
    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
    await collection.updateOne({ id: user.id }, { $set: { resetToken: user.resetToken, resetTokenExpiresAt: user.resetTokenExpiresAt } });
    console.info(`[auth] Password reset token for ${user.email}: ${user.resetToken}`);
    return user.resetToken;
  }

  static async resetPassword(token: string, password: string) {
    if (typeof token !== 'string') throw new ApiError(400, 'Invalid or expired reset token.');
    validatePassword(password);
    const collection = getUsers();
    const user = await collection.findOne({ resetToken: token });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < Date.now()) throw new ApiError(400, 'Invalid or expired reset token.');
    await collection.updateOne({ id: user.id }, { $set: { passwordHash: await bcrypt.hash(password, 10) }, $unset: { resetToken: '', resetTokenExpiresAt: '' } });
  }

  static revokeToken(token: string) {
    return getDatabase().collection('revoked_tokens').insertOne({ token, createdAt: new Date() });
  }

  static async isTokenRevoked(token: string) {
    return Boolean(await getDatabase().collection('revoked_tokens').findOne({ token }));
  }
}
