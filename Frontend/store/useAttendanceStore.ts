import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
  workHours?: number;
}

interface AttendanceState {
  records: AttendanceRecord[];
  isLoading: boolean;
  fetchAttendance: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [
    {
      id: 'att_01',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      date: new Date().toISOString().split('T')[0],
      checkIn: '09:02 AM',
      status: 'Present',
      workHours: 8.5,
    },
  ],
  isLoading: false,

  fetchAttendance: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/attendance');
      if (response.data) {
        set({ records: response.data });
      }
    } catch (error: any) {
      // Fallback gracefully if API is offline
    } finally {
      set({ isLoading: false });
    }
  },

  checkIn: async () => {
    set({ isLoading: true });
    try {
      const response = await api.post('/attendance/check-in');
      snackbar.success('Successfully checked in!');
      if (response.data) {
        set((state) => ({ records: [response.data, ...state.records] }));
      }
    } catch (error: any) {
      snackbar.error(error.message || 'Check-in failed');
    } finally {
      set({ isLoading: false });
    }
  },

  checkOut: async () => {
    set({ isLoading: true });
    try {
      const response = await api.post('/attendance/check-out');
      snackbar.success('Successfully checked out!');
      if (response.data) {
        set((state) => ({
          records: state.records.map((r) => (r.id === response.data.id ? response.data : r)),
        }));
      }
    } catch (error: any) {
      snackbar.error(error.message || 'Check-out failed');
    } finally {
      set({ isLoading: false });
    }
  },
}));
