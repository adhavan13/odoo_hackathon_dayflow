export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'paid' | 'casual' | 'sick' | 'unpaid' | 'maternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

export interface LeaveBalance {
  paid: { total: number; used: number; remaining: number };
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
}

let leaveRequests: LeaveRequest[] = [
  {
    id: 'lr_1',
    employeeId: 'emp_1',
    employeeName: 'Alex Rivera',
    type: 'casual',
    startDate: '2026-08-25',
    endDate: '2026-08-27',
    days: 3,
    reason: 'Family event and travel.',
    status: 'pending',
    appliedOn: '2026-08-20',
  },
  {
    id: 'lr_2',
    employeeId: 'emp_3',
    employeeName: 'Michael Chen',
    type: 'sick',
    startDate: '2026-08-10',
    endDate: '2026-08-11',
    days: 2,
    reason: 'Fever and medical rest.',
    status: 'approved',
    appliedOn: '2026-08-09',
  },
];

export class LeaveService {
  static async getLeaveRequests(employeeId?: string) {
    if (employeeId) {
      return leaveRequests.filter((r) => r.employeeId === employeeId);
    }
    return leaveRequests;
  }

  static async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    return {
      paid: { total: 18, used: 4, remaining: 14 },
      casual: { total: 12, used: 3, remaining: 9 },
      sick: { total: 10, used: 2, remaining: 8 },
      unpaid: { total: 30, used: 0, remaining: 30 },
    };
  }

  static async applyLeave(data: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) {
    const newRequest: LeaveRequest = {
      ...data,
      id: `lr_${Date.now()}`,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    leaveRequests.unshift(newRequest);
    return newRequest;
  }

  static async updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    const req = leaveRequests.find((r) => r.id === id);
    if (!req) {
      throw new Error('Leave request not found');
    }
    req.status = status;
    return req;
  }
}
