import { getDatabase } from "../config/database";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  type?: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  days?: number;
  reason?: string;
  attachmentUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "pending" | "approved" | "rejected";
  appliedOn: string;
}

export interface LeaveBalance {
  employeeId: string;
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
}

export interface CompanyHoliday {
  id: string;
  date: string;
  name: string;
  type?: string;
}

const seedLeaveRequests: LeaveRequest[] = [
  {
    id: "lv_101",
    employeeId: "usr_emp_02",
    employeeName: "Alex Rivera",
    leaveType: "Paid Time off",
    type: "paid",
    startDate: "2026-05-13",
    endDate: "2026-05-14",
    daysCount: 2,
    days: 2,
    reason: "Family vacation trip",
    status: "Approved",
    appliedOn: "2026-05-01",
  },
  {
    id: "lv_102",
    employeeId: "usr_emp_02",
    employeeName: "Alex Rivera",
    leaveType: "Sick Leave",
    type: "sick",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    daysCount: 2,
    days: 2,
    attachmentUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300",
    reason: "Viral fever rest prescribed by doctor",
    status: "Approved",
    appliedOn: "2026-08-09",
  },
  {
    id: "lv_103",
    employeeId: "usr_emp_02",
    employeeName: "Alex Rivera",
    leaveType: "Paid Time off",
    type: "paid",
    startDate: "2026-10-28",
    endDate: "2026-10-28",
    daysCount: 1,
    days: 1,
    reason: "Personal errand",
    status: "Pending",
    appliedOn: "2026-08-20",
  },
  {
    id: "lv_104",
    employeeId: "usr_emp_03",
    employeeName: "Michael Chen",
    leaveType: "Sick Leave",
    type: "sick",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    daysCount: 2,
    days: 2,
    reason: "Fever and medical rest.",
    status: "Approved",
    appliedOn: "2026-08-09",
  },
];

const seedHolidays: CompanyHoliday[] = [
  { id: 'hol_01', date: '2026-01-26', name: 'Republic Day' },
  { id: 'hol_02', date: '2026-03-04', name: 'Maha Shivratri' },
  { id: 'hol_03', date: '2026-03-25', name: 'Holi' },
  { id: 'hol_04', date: '2026-04-03', name: 'Good Friday' },
  { id: 'hol_05', date: '2026-04-14', name: 'Tamil New Year / Ambedkar Jayanti' },
  { id: 'hol_06', date: '2026-05-01', name: 'May Day / Labor Day' },
  { id: 'hol_07', date: '2026-08-15', name: 'Independence Day' },
  { id: 'hol_08', date: '2026-10-02', name: 'Gandhi Jayanti' },
  { id: 'hol_09', date: '2026-10-20', name: 'Vijayadashami / Dussehra' },
  { id: 'hol_10', date: '2026-11-08', name: 'Deepavali / Diwali' },
  { id: 'hol_11', date: '2026-12-25', name: 'Christmas Day' },
];

export class LeaveService {
  private static collection() {
    return getDatabase().collection<LeaveRequest>("leave_requests");
  }

  private static balancesCollection() {
    return getDatabase().collection<LeaveBalance>("leave_balances");
  }

  private static holidaysCollection() {
    return getDatabase().collection<CompanyHoliday>("company_holidays");
  }

  private static async ensureSeedData() {
    const collection = this.collection();
    if ((await collection.countDocuments()) === 0)
      await collection.insertMany(seedLeaveRequests);
  }

  private static async ensureHolidaysSeedData() {
    const col = this.holidaysCollection();
    if ((await col.countDocuments()) === 0) {
      await col.insertMany(seedHolidays);
    }
  }

  static async getLeaveRequests(employeeId?: string, secondaryId?: string) {
    await this.ensureSeedData();
    if (!employeeId && !secondaryId) {
      return this.collection().find({}).toArray();
    }
    const filterConditions: any[] = [];
    if (employeeId) filterConditions.push({ employeeId });
    if (secondaryId) filterConditions.push({ employeeId: secondaryId });
    
    return this.collection()
      .find(filterConditions.length > 1 ? { $or: filterConditions } : filterConditions[0])
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

  static async applyLeave(data: any) {
    await this.ensureSeedData();
    const leaveType = data.leaveType || (data.type === 'sick' ? 'Sick Leave' : data.type === 'unpaid' ? 'Unpaid Leaves' : 'Paid Time off');
    const daysCount = data.daysCount || data.days || 1;

    const newRequest: LeaveRequest = {
      id: `lv_${Date.now()}`,
      employeeId: data.employeeId || 'usr_emp_02',
      employeeName: data.employeeName || 'Alex Rivera',
      leaveType,
      type: leaveType.toLowerCase().includes('sick') ? 'sick' : leaveType.toLowerCase().includes('unpaid') ? 'unpaid' : 'paid',
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount,
      days: daysCount,
      reason: data.reason || '',
      attachmentUrl: data.attachmentUrl || '',
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    await this.collection().insertOne(newRequest);
    return newRequest;
  }

  static async updateLeaveStatus(id: string, newStatusInput: string) {
    await this.ensureSeedData();
    const req = await this.collection().findOne({ id });
    if (!req) {
      throw new Error("Leave request not found");
    }

    const newStatus = newStatusInput.toLowerCase() === 'approved' ? 'Approved' : 'Rejected';
    const isPreviousApproved = (req.status || '').toLowerCase() === 'approved';
    const isNewApproved = newStatus === 'Approved';

    if (isNewApproved && !isPreviousApproved) {
      const balanceCol = this.balancesCollection();
      const currentBalance = await this.getLeaveBalance(req.employeeId);
      
      const leaveTypeKey: 'paid' | 'sick' | 'unpaid' = (req.leaveType || req.type || '')
        .toLowerCase()
        .includes('sick')
        ? 'sick'
        : (req.leaveType || req.type || '').toLowerCase().includes('unpaid')
        ? 'unpaid'
        : 'paid';

      if (currentBalance[leaveTypeKey]) {
        const days = req.daysCount || req.days || 1;
        const newUsed = currentBalance[leaveTypeKey].used + days;
        const newRemaining = currentBalance[leaveTypeKey].total - newUsed;
        
        await balanceCol.updateOne(
          { employeeId: req.employeeId },
          { $set: { [`${leaveTypeKey}.used`]: newUsed, [`${leaveTypeKey}.remaining`]: newRemaining } }
        );
      }
    }
    
    if (!isNewApproved && isPreviousApproved) {
      const balanceCol = this.balancesCollection();
      const currentBalance = await this.getLeaveBalance(req.employeeId);
      
      const leaveTypeKey: 'paid' | 'sick' | 'unpaid' = (req.leaveType || req.type || '')
        .toLowerCase()
        .includes('sick')
        ? 'sick'
        : (req.leaveType || req.type || '').toLowerCase().includes('unpaid')
        ? 'unpaid'
        : 'paid';

      if (currentBalance[leaveTypeKey]) {
        const days = req.daysCount || req.days || 1;
        const newUsed = Math.max(0, currentBalance[leaveTypeKey].used - days);
        const newRemaining = currentBalance[leaveTypeKey].total - newUsed;
        
        await balanceCol.updateOne(
          { employeeId: req.employeeId },
          { $set: { [`${leaveTypeKey}.used`]: newUsed, [`${leaveTypeKey}.remaining`]: newRemaining } }
        );
      }
    }

    await this.collection().updateOne({ id }, { $set: { status: newStatus } });
    return { ...req, status: newStatus };
  }

  // Company Holidays & Announcements
  static async getHolidays() {
    await this.ensureHolidaysSeedData();
    return this.holidaysCollection().find({}).toArray();
  }

  static async createHoliday(date: string, name: string) {
    await this.ensureHolidaysSeedData();
    const newHoliday: CompanyHoliday = {
      id: `hol_${Date.now()}`,
      date,
      name,
    };
    await this.holidaysCollection().insertOne(newHoliday);
    return newHoliday;
  }
}
