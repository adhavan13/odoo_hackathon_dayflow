import { getDatabase } from "../config/database";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: "ADMIN" | "HR" | "EMPLOYEE";
  action: string;
  category: "attendance" | "leave" | "profile" | "auth";
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

const seedActivities: ActivityLog[] = [
  {
    id: "act_101",
    userId: "usr_emp_02",
    userName: "Alex Rivera",
    userRole: "EMPLOYEE",
    action: "LEAVE_APPLIED",
    category: "leave",
    description: "Submitted a 2-day Paid Time Off application for May 13 - May 14",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "act_102",
    userId: "usr_admin_01",
    userName: "Sarah Jenkins",
    userRole: "ADMIN",
    action: "LEAVE_APPROVED",
    category: "leave",
    description: "Approved Sick Leave request for Michael Chen",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: "act_103",
    userId: "usr_emp_02",
    userName: "Alex Rivera",
    userRole: "EMPLOYEE",
    action: "PUNCH_IN",
    category: "attendance",
    description: "Punched in for workday at 09:00 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
  },
  {
    id: "act_104",
    userId: "usr_emp_03",
    userName: "Michael Chen",
    userRole: "EMPLOYEE",
    action: "PUNCH_IN",
    category: "attendance",
    description: "Punched in for workday at 09:15 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
  },
  {
    id: "act_105",
    userId: "usr_emp_02",
    userName: "Alex Rivera",
    userRole: "EMPLOYEE",
    action: "PROFILE_UPDATED",
    category: "profile",
    description: "Updated personal skills and bio in profile section",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "act_106",
    userId: "usr_admin_01",
    userName: "Sarah Jenkins",
    userRole: "ADMIN",
    action: "LEAVE_REJECTED",
    category: "leave",
    description: "Refused leave request for Pam Beesly due to project deadline",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: "act_107",
    userId: "usr_emp_02",
    userName: "Alex Rivera",
    userRole: "EMPLOYEE",
    action: "LOGIN",
    category: "auth",
    description: "Successfully logged in from web portal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

export class ActivityService {
  private static collection() {
    return getDatabase().collection<ActivityLog>("activity_logs");
  }

  private static async ensureSeedData() {
    const col = this.collection();
    if ((await col.countDocuments()) === 0) {
      await col.insertMany(seedActivities);
    }
  }

  static async getActivities(options?: {
    userId?: string;
    isEmployeeRole?: boolean;
    category?: string;
    action?: string;
    limit?: number;
  }) {
    await this.ensureSeedData();
    const filter: any = {};

    if (options?.isEmployeeRole && options?.userId) {
      filter.$or = [{ userId: options.userId }, { userName: "Alex Rivera" }];
    } else if (options?.userId) {
      filter.userId = options.userId;
    }

    if (options?.category && options.category !== "all") {
      filter.category = options.category;
    }

    if (options?.action && options.action !== "all") {
      filter.action = options.action;
    }

    const limit = options?.limit || 50;

    return this.collection()
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  static async getActivityAnalytics(userId?: string, isEmployeeRole?: boolean) {
    const activities = await this.getActivities({ userId, isEmployeeRole, limit: 200 });

    const total = activities.length;
    const attendanceCount = activities.filter((a) => a.category === "attendance").length;
    const leaveCount = activities.filter((a) => a.category === "leave").length;
    const profileCount = activities.filter((a) => a.category === "profile").length;
    const authCount = activities.filter((a) => a.category === "auth").length;

    const approvedLeaves = activities.filter((a) => a.action === "LEAVE_APPROVED").length;
    const pendingLeaves = activities.filter((a) => a.action === "LEAVE_APPLIED").length;

    return {
      total,
      attendanceCount,
      leaveCount,
      profileCount,
      authCount,
      approvedLeaves,
      pendingLeaves,
      lastActivityTime: activities[0]?.timestamp || new Date().toISOString(),
    };
  }

  static async logActivity(data: Omit<ActivityLog, "id" | "timestamp">) {
    await this.ensureSeedData();
    const newLog: ActivityLog = {
      ...data,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    await this.collection().insertOne(newLog);
    return newLog;
  }
}
