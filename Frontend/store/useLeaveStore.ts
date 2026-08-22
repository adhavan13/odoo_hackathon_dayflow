import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Casual' | 'Sick' | 'Paid' | 'Unpaid' | 'Maternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

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
      id: 'lv_01',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      leaveType: 'Casual',
      startDate: '2026-08-25',
      endDate: '2026-08-27',
      reason: 'Personal family event',
      status: 'Pending',
      appliedOn: '2026-08-22',
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
      snackbar.success('Leave request submitted successfully');
      const newLeave: LeaveRequest = response.data || {
        ...leaveData,
        id: `lv_${Date.now()}`,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };
      set((state) => ({ leaves: [newLeave, ...state.leaves] }));
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to submit leave request');
    } finally {
      set({ isLoading: false });
    }
  },

  updateLeaveStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      snackbar.success(`Leave request ${status.toLowerCase()}`);
      set((state) => ({
        leaves: state.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to update leave status');
    } finally {
      set({ isLoading: false });
    }
  },
}));
