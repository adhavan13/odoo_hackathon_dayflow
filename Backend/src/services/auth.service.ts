import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config";
import { ApiError } from "../utils/apiError";
import { getDatabase } from "../config/database";
import { EmailService } from "./email.service";

export interface UserDTO {
  id: string;
  employeeId?: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  companyId?: string;
  name?: string;
  phone?: string;
  logo?: string;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

interface StoredUser extends UserDTO {
  username?: string;
  passwordHash: string;
  emailVerified: boolean;
  status: "active" | "inactive";
  verificationToken?: string;
  verificationTokenExpiresAt?: number;
  verificationOtpHash?: string;
  verificationOtpExpiresAt?: number;
  resetToken?: string;
  resetTokenExpiresAt?: number;
}

interface Company {
  id: string;
  name: string;
  companyCode: string;
  logo?: string;
  createdAt: Date;
}

interface PendingSignup {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  logo?: string;
  otpHash: string;
  expiresAt: number;
}

// In-memory cache for pending signups (OTP must be verified before storing in MongoDB)
const pendingRegistrations = new Map<string, PendingSignup>();

const seedUsers: StoredUser[] = [
  {
    id: "usr_admin_01",
    employeeId: "EMP1002",
    email: "sarah.j@company.com",
    role: "HR",
    name: "Sarah Jenkins",
    passwordHash: bcrypt.hashSync("StrongPassword123!", 10),
    emailVerified: true,
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    department: "Human Resources",
    designation: "HR Officer / Admin",
  },
  {
    id: "usr_emp_02",
    employeeId: "EMP1001",
    email: "alex.rivera@company.com",
    role: "EMPLOYEE",
    name: "Alex Rivera",
    passwordHash: bcrypt.hashSync("StrongPassword123!", 10),
    emailVerified: true,
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    department: "Software Engineering",
    designation: "Senior Frontend Developer",
  },
];

const publicUser = ({
  passwordHash,
  username,
  verificationToken,
  verificationTokenExpiresAt,
  resetToken,
  resetTokenExpiresAt,
  verificationOtpHash,
  verificationOtpExpiresAt,
  ...user
}: StoredUser): UserDTO => user;

const getUsers = () => getDatabase().collection<StoredUser>("users");
const getCompanies = () => getDatabase().collection<Company>("companies");

const ensureSeedUsers = async () => {
  const collection = getUsers();
  for (const seed of seedUsers) {
    const existing = await collection.findOne({ email: seed.email });
    if (!existing) {
      await collection.insertOne(seed);
    }
  }
};

const validatePassword = (password: string) => {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
    );
  }
};

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const createVerificationOtp = () => String(crypto.randomInt(100000, 1000000));

const createToken = (user: UserDTO) =>
  jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

export class AuthService {
  static async signup(
    companyName: string,
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    logo?: string,
  ) {
    if (typeof companyName !== "string" || companyName.trim().length < 2)
      throw new ApiError(400, "Company name is required.");
    if (typeof name !== "string" || name.trim().length < 2)
      throw new ApiError(400, "Name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new ApiError(400, "Invalid email address.");

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.endsWith("@gmail.com")) {
      throw new ApiError(
        400,
        "Please enter a corporate email address. Personal @gmail.com domains are not allowed for organization registration.",
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new ApiError(
        400,
        "Please enter a valid 10-digit Indian mobile number (e.g. 9036462813).",
      );
    }

    if (password !== confirmPassword)
      throw new ApiError(400, "Password and confirmPassword must match.");
    validatePassword(password);
    await ensureSeedUsers();
    const collection = getUsers();
    if (await collection.findOne({ email: normalizedEmail }))
      throw new ApiError(409, "Email is already registered.");

    const verificationOtp = createVerificationOtp();
    const passwordHash = await bcrypt.hash(password, 10);

    // Save registration details in temporary pending cache ONLY
    // NOTHING IS INSERTED INTO MONGODB UNTIL OTP IS VERIFIED!
    pendingRegistrations.set(normalizedEmail, {
      companyName: companyName.trim(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      ...(logo ? { logo } : {}),
      otpHash: hashOtp(verificationOtp),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send OTP via Nodemailer
    await EmailService.sendOtpEmail({
      toEmail: normalizedEmail,
      recipientName: name.trim(),
      otp: verificationOtp,
      companyName: companyName.trim(),
    });

    return {
      success: true,
      message: "Verification OTP sent to your corporate email.",
    };
  }

  static async sendVerificationOtp(email: string) {
    if (typeof email !== "string")
      throw new ApiError(400, "Email is required.");
    const normalizedEmail = email.trim().toLowerCase();

    // Check if there is a pending registration
    const pending = pendingRegistrations.get(normalizedEmail);
    if (pending) {
      const otp = createVerificationOtp();
      pending.otpHash = hashOtp(otp);
      pending.expiresAt = Date.now() + 10 * 60 * 1000;
      pendingRegistrations.set(normalizedEmail, pending);

      await EmailService.sendOtpEmail({
        toEmail: normalizedEmail,
        recipientName: pending.name,
        otp,
        companyName: pending.companyName,
      });

      return { success: true };
    }

    const collection = getUsers();
    const user = await collection.findOne({ email: normalizedEmail });
    if (!user) throw new ApiError(404, "Pending registration not found. Please sign up again.");
    if (user.emailVerified)
      throw new ApiError(400, "Email is already verified.");
    const otp = createVerificationOtp();
    await collection.updateOne(
      { id: user.id },
      {
        $set: {
          verificationOtpHash: hashOtp(otp),
          verificationOtpExpiresAt: Date.now() + 10 * 60 * 1000,
        },
      },
    );

    await EmailService.sendOtpEmail({
      toEmail: user.email,
      recipientName: user.name || "Admin",
      otp,
    });

    return { success: true };
  }

  static async verifyEmailOtp(email: string, otp: string) {
    if (typeof email !== "string" || !/^\d{6}$/.test(otp))
      throw new ApiError(400, "Email and a 6-digit OTP are required.");
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check Pending Registrations Cache (Pre-verification)
    const pending = pendingRegistrations.get(normalizedEmail);
    if (pending) {
      if (pending.otpHash !== hashOtp(otp) || pending.expiresAt < Date.now()) {
        throw new ApiError(400, "Invalid or expired OTP.");
      }

      // OTP IS VERIFIED! NOW COMMIT COMPANY & USER TO MONGODB DATABASE
      const companyCollection = getCompanies();
      const companyCodeBase =
        pending.companyName
          .split(/\s+/)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 4) || "COMP";
      let companyCode = companyCodeBase;
      let codeNumber = 1;
      while (await companyCollection.findOne({ companyCode }))
        companyCode = `${companyCodeBase}${codeNumber++}`;

      const company: Company = {
        id: crypto.randomUUID(),
        name: pending.companyName,
        companyCode,
        ...(pending.logo ? { logo: pending.logo } : {}),
        createdAt: new Date(),
      };

      const user: StoredUser = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        username: normalizedEmail,
        companyId: company.id,
        role: "ADMIN",
        name: pending.name,
        phone: pending.phone,
        ...(pending.logo ? { logo: pending.logo } : {}),
        passwordHash: pending.passwordHash,
        emailVerified: true,
        status: "active",
      };

      await companyCollection.insertOne(company);
      await getUsers().insertOne(user);

      // Clean up pending cache
      pendingRegistrations.delete(normalizedEmail);

      const safeUser = publicUser(user);
      const accessToken = createToken(safeUser);
      return {
        user: safeUser,
        company,
        accessToken,
      };
    }

    // 2. Fallback check for existing users
    const collection = getUsers();
    const user = await collection.findOne({ email: normalizedEmail });
    if (
      !user ||
      user.verificationOtpHash !== hashOtp(otp) ||
      !user.verificationOtpExpiresAt ||
      user.verificationOtpExpiresAt < Date.now()
    )
      throw new ApiError(400, "Invalid or expired OTP.");

    await collection.updateOne(
      { id: user.id },
      {
        $set: { emailVerified: true },
        $unset: {
          verificationToken: "",
          verificationTokenExpiresAt: "",
          verificationOtpHash: "",
          verificationOtpExpiresAt: "",
        },
      },
    );

    const safeUser = publicUser(user);
    const accessToken = createToken(safeUser);
    return {
      user: safeUser,
      accessToken,
    };
  }

  static async verifyEmail(token: string) {
    const collection = getUsers();
    const user = await collection.findOne({ verificationToken: token });
    if (
      !user ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < Date.now()
    )
      throw new ApiError(400, "Invalid or expired verification token.");
    await collection.updateOne(
      { id: user.id },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: "", verificationTokenExpiresAt: "" },
      },
    );
  }

  static async login(email: string, password: string) {
    if (typeof email !== "string" || typeof password !== "string")
      throw new ApiError(401, "Invalid email or password.");
    await ensureSeedUsers();
    const user = await getUsers().findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new ApiError(401, "Invalid email or password.");
    if (!user.emailVerified)
      throw new ApiError(403, "Please verify your email before logging in.");
    if (user.status !== "active")
      throw new ApiError(403, "Your account is inactive.");
    const safeUser = publicUser(user);
    const accessToken = createToken(safeUser);
    return { user: safeUser, accessToken };
  }

  static async getProfile(userId: string) {
    const user = await getUsers().findOne({ id: userId });
    if (!user) throw new ApiError(404, "User not found.");
    let company: Company | null = null;
    if (user.companyId) {
      company = await getCompanies().findOne({ id: user.companyId });
    }
    const safeUser = publicUser(user);
    return {
      ...safeUser,
      logo: company?.logo || safeUser.logo || safeUser.avatarUrl,
      companyName: company?.name,
    };
  }

  static async updateProfile(userId: string, updates: Partial<StoredUser>) {
    const collection = getUsers();
    const user = await collection.findOne({ id: userId });
    if (!user) throw new ApiError(404, "User not found.");

    await collection.updateOne({ id: userId }, { $set: updates });
    const updated = await collection.findOne({ id: userId });
    return publicUser(updated!);
  }

  static async forgotPassword(email: string) {
    if (typeof email !== "string") return;
    const collection = getUsers();
    const user = await collection.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) return;
    user.resetToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
    await collection.updateOne(
      { id: user.id },
      {
        $set: {
          resetToken: user.resetToken,
          resetTokenExpiresAt: user.resetTokenExpiresAt,
        },
      },
    );
    console.info(`[auth] Password reset token for ${user.email}: ${user.resetToken}`);
    return user.resetToken;
  }

  static async resetPassword(token: string, password: string) {
    if (typeof token !== "string" || typeof password !== "string")
      throw new ApiError(400, "Token and password are required.");
    validatePassword(password);
    const collection = getUsers();
    const user = await collection.findOne({ resetToken: token });
    if (
      !user ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < Date.now()
    )
      throw new ApiError(400, "Invalid or expired reset token.");
    const passwordHash = await bcrypt.hash(password, 10);
    await collection.updateOne(
      { id: user.id },
      {
        $set: { passwordHash, emailVerified: true, status: "active" },
        $unset: { resetToken: "", resetTokenExpiresAt: "" },
      },
    );
  }

  private static revokedTokens = new Set<string>();

  static async revokeToken(token: string) {
    this.revokedTokens.add(token);
  }

  static async isTokenRevoked(token: string): Promise<boolean> {
    return this.revokedTokens.has(token);
  }
}
