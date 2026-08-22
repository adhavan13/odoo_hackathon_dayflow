import crypto from "crypto";
import { getDatabase } from "../config/database";
import { EmailService } from "./email.service";

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  department: string;
  designation: string;
  joinDate: string;
  status: "active" | "on_leave" | "terminated";
  phone: string;
  avatarUrl: string;
}

const seedEmployees: EmployeeProfile[] = [
  {
    id: "emp_1",
    employeeCode: "EMP-1001",
    name: "Alex Rivera",
    email: "alex.rivera@company.com",
    role: "employee",
    department: "Engineering",
    designation: "Senior Frontend Developer",
    joinDate: "2023-01-15",
    status: "active",
    phone: "+1 (555) 234-5678",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "emp_2",
    employeeCode: "EMP-1002",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    role: "admin",
    department: "Human Resources",
    designation: "HR Officer / Admin",
    joinDate: "2022-04-01",
    status: "active",
    phone: "+1 (555) 345-6789",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    id: "emp_3",
    employeeCode: "EMP-1003",
    name: "Michael Chen",
    email: "michael.c@company.com",
    role: "employee",
    department: "Product",
    designation: "Product Manager",
    joinDate: "2023-06-10",
    status: "active",
    phone: "+1 (555) 456-7890",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
];

export class EmployeeService {
  private static collection() {
    return getDatabase().collection<EmployeeProfile>("employees");
  }

  private static usersCollection() {
    return getDatabase().collection("users");
  }

  private static async ensureSeedData() {
    const collection = this.collection();
    if ((await collection.countDocuments()) === 0)
      await collection.insertMany(seedEmployees);
  }

  static async getAllEmployees() {
    await this.ensureSeedData();
    return this.collection().find({}).toArray();
  }

  static async getEmployeeById(id: string) {
    await this.ensureSeedData();
    return this.collection().findOne({ $or: [{ id }, { employeeCode: id }] });
  }

  static async createEmployee(data: {
    name: string;
    email: string;
    department?: string;
    designation?: string;
    phone?: string;
    avatarUrl?: string;
    role?: "admin" | "employee";
  }) {
    await this.ensureSeedData();
    const existing = await this.collection().findOne({ email: data.email.trim().toLowerCase() });
    if (existing) {
      throw new Error("Employee with this email already exists.");
    }

    const empId = `emp_${Date.now()}`;
    const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const normalizedEmail = data.email.trim().toLowerCase();

    const newEmp: EmployeeProfile = {
      id: empId,
      employeeCode,
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role || "employee",
      department: data.department || "Software Engineering",
      designation: data.designation || "Software Developer",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      phone: data.phone || "+1 (555) 000-0000",
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    };

    // Create user record with reset token for password creation
    await this.usersCollection().insertOne({
      id: `usr_${Date.now()}`,
      employeeId: employeeCode,
      email: normalizedEmail,
      role: (data.role || "employee").toUpperCase(),
      name: data.name.trim(),
      passwordHash: "", // Will be set via password reset link
      emailVerified: true,
      status: "active",
      resetToken,
      resetTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await this.collection().insertOne(newEmp);

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send password setup invitation email to new employee
    await EmailService.sendPasswordSetupEmail({
      toEmail: normalizedEmail,
      recipientName: data.name.trim(),
      resetToken,
      resetLink,
      employeeCode,
      designation: newEmp.designation,
    });

    return {
      employee: newEmp,
      resetToken,
      resetLink,
    };
  }

  static async updateEmployeeProfile(
    id: string,
    updates: Partial<EmployeeProfile>,
  ) {
    await this.ensureSeedData();
    return this.collection().findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" },
    );
  }
}
