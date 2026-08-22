import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Paid Time off' | 'Sick Leave' | 'Unpaid Leaves';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

export interface PublicHoliday {
  date: string;
  name: string;
}

export const PUBLIC_HOLIDAYS_2026: PublicHoliday[] = [
  { date: '2026-01-01', name: 'New Year Day' },
  { date: '2026-01-14', name: 'Pongal / Harvest Festival' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'Maha Shivratri' },
  { date: '2026-03-25', name: 'Holi' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-14', name: 'Tamil New Year / Ambedkar Jayanti' },
  { date: '2026-05-01', name: 'Labor Day' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-08-28', name: 'Raksha Bandhan' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-11-08', name: 'Diwali / Festival of Lights' },
  { date: '2026-12-25', name: 'Christmas' },
];

interface LeaveState {
  leaves: LeaveRequest[];
  isLoading: boolean;
  fetchLeaves: () => Promise<void>;
  applyLeave: (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => Promise<void>;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: [
    {
      id: 'lv_101',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      leaveType: 'Paid Time off',
      startDate: '2026-05-13',
      endDate: '2026-05-14',
      daysCount: 2,
      reason: 'Family vacation trip',
      status: 'Approved',
      appliedOn: '2026-05-01',
    },
    {
      id: 'lv_102',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      leaveType: 'Sick Leave',
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      daysCount: 2,
      attachmentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300',
      reason: 'Viral fever rest prescribed by doctor',
      status: 'Approved',
      appliedOn: '2026-08-09',
    },
    {
      id: 'lv_103',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      leaveType: 'Paid Time off',
      startDate: '2026-10-28',
      endDate: '2026-10-28',
      daysCount: 1,
      reason: 'Personal errand',
      status: 'Pending',
      appliedOn: '2026-08-20',
    },
    {
      id: 'lv_104',
      employeeId: 'usr_emp_03',
      employeeName: 'John Doe',
      leaveType: 'Paid Time off',
      startDate: '2026-10-28',
      endDate: '2026-10-28',
      daysCount: 1,
      reason: 'Out of town wedding',
      status: 'Pending',
      appliedOn: '2026-08-21',
    },
    {
      id: 'lv_105',
      employeeId: 'usr_emp_04',
      employeeName: 'Michael Scott',
      leaveType: 'Sick Leave',
      startDate: '2026-09-02',
      endDate: '2026-09-03',
      daysCount: 2,
      reason: 'Burned foot on George Foreman grill',
      status: 'Pending',
      appliedOn: '2026-08-22',
    },
    {
      id: 'lv_106',
      employeeId: 'usr_emp_05',
      employeeName: 'Pam Beesly',
      leaveType: 'Paid Time off',
      startDate: '2026-06-15',
      endDate: '2026-06-18',
      daysCount: 4,
      reason: 'Art exhibition visit',
      status: 'Rejected',
      appliedOn: '2026-06-01',
    },
  ],
  isLoading: false,

  fetchLeaves: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/leaves');
      if (response.data) {
        set({ leaves: response.data });
      }
    } catch (error) {
      // Keep initial state if endpoint offline
    } finally {
      set({ isLoading: false });
    }
  },

  applyLeave: async (leaveData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/leaves/apply', leaveData);
      snackbar.success('Time off request submitted successfully');
      const newLeave: LeaveRequest = response.data || {
        ...leaveData,
        id: `lv_${Date.now()}`,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };
      set((state) => ({ leaves: [newLeave, ...state.leaves] }));
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to submit time off request');
      const newLeave: LeaveRequest = {
        ...leaveData,
        id: `lv_${Date.now()}`,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };
      set((state) => ({ leaves: [newLeave, ...state.leaves] }));
    } finally {
      set({ isLoading: false });
    }
  },

  updateLeaveStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      snackbar.success(`Time off request ${status.toLowerCase()}`);
      set((state) => ({
        leaves: state.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
    } catch (error: any) {
      snackbar.success(`Time off request ${status.toLowerCase()}`);
      set((state) => ({
        leaves: state.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
