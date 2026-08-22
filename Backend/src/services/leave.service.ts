import { getDatabase } from "../config/database";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "paid" | "sick" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  attachmentUrl?: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

export interface LeaveBalance {
  employeeId: string;
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
}

const seedLeaveRequests: LeaveRequest[] = [
  {
    id: "lr_1",
    employeeId: "emp_1",
    employeeName: "Alex Rivera",
    type: "paid",
    startDate: "2026-08-25",
    endDate: "2026-08-27",
    days: 3,
    reason: "Family event and travel.",
    status: "pending",
    appliedOn: "2026-08-20",
  },
  {
    id: "lr_2",
    employeeId: "emp_3",
    employeeName: "Michael Chen",
    type: "sick",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    days: 2,
    reason: "Fever and medical rest.",
    status: "approved",
    appliedOn: "2026-08-09",
  },
];

export class LeaveService {
  private static collection() {
    return getDatabase().collection<LeaveRequest>("leave_requests");
  }

  private static balancesCollection() {
    return getDatabase().collection<LeaveBalance>("leave_balances");
  }

  private static async ensureSeedData() {
    const collection = this.collection();
    if ((await collection.countDocuments()) === 0)
      await collection.insertMany(seedLeaveRequests);
  }

  static async getLeaveRequests(employeeId?: string) {
    await this.ensureSeedData();
    return this.collection()
      .find(employeeId ? { employeeId } : {})
      .toArray();
  }

  static async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    const col = this.balancesCollection();
    const existing = await col.findOne({ employeeId });
    if (existing) return existing;

    const newBalance: LeaveBalance = {
      employeeId,
      paid: { total: 24, used: 0, remaining: 24 },
      sick: { total: 7, used: 0, remaining: 7 },
      unpaid: { total: 30, used: 0, remaining: 30 },
    };
    await col.insertOne(newBalance);
    return newBalance;
  }

  static async applyLeave(
    data: Omit<LeaveRequest, "id" | "status" | "appliedOn">,
  ) {
    await this.ensureSeedData();
    const newRequest: LeaveRequest = {
      ...data,
      id: `lr_${Date.now()}`,
      status: "pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    await this.collection().insertOne(newRequest);
    return newRequest;
  }

  static async updateLeaveStatus(id: string, status: "approved" | "rejected") {
    await this.ensureSeedData();
    const req = await this.collection().findOne({ id });
    if (!req) {
      throw new Error("Leave request not found");
    }
    
    // Check if we are approving, and if it wasn't already approved
    if (status === "approved" && req.status !== "approved") {
      const balanceCol = this.balancesCollection();
      const currentBalance = await this.getLeaveBalance(req.employeeId);
      
      const leaveType = req.type as "paid" | "sick" | "unpaid";
      if (currentBalance[leaveType]) {
        const newUsed = currentBalance[leaveType].used + req.days;
        const newRemaining = currentBalance[leaveType].total - newUsed;
        
        await balanceCol.updateOne(
          { employeeId: req.employeeId },
          { $set: { [`${leaveType}.used`]: newUsed, [`${leaveType}.remaining`]: newRemaining } }
        );
      }
    }
    
    // If we are rejecting a previously approved request, we should restore balance
    if (status === "rejected" && req.status === "approved") {
      const balanceCol = this.balancesCollection();
      const currentBalance = await this.getLeaveBalance(req.employeeId);
      
      const leaveType = req.type as "paid" | "sick" | "unpaid";
      if (currentBalance[leaveType]) {
        const newUsed = currentBalance[leaveType].used - req.days;
        const newRemaining = currentBalance[leaveType].total - newUsed;
        
        await balanceCol.updateOne(
          { employeeId: req.employeeId },
          { $set: { [`${leaveType}.used`]: newUsed, [`${leaveType}.remaining`]: newRemaining } }
        );
      }
    }

    await this.collection().updateOne({ id }, { $set: { status } });
    return { ...req, status };
  }
}
