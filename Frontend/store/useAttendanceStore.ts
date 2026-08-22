import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours?: string;
  extraHours?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
}

export interface AttendanceState {
  records: AttendanceRecord[];
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInTimestamp: number | null;
  isLoading: boolean;
  fetchAttendance: () => Promise<void>;
  fetchToday: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  // Compatibility aliases
  isPunchedIn?: boolean;
  todayRecord?: { inTime?: string; outTime?: string };
  checkTodayAttendance?: () => Promise<void>;
  punchIn?: () => Promise<void>;
  punchOut?: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [
    {
      id: 'att_101',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      department: 'Software Engineering',
      date: '2025-10-28',
      checkIn: '10:00',
      checkOut: '19:00',
      workHours: '09:00',
      extraHours: '01:00',
      status: 'Present',
    },
    {
      id: 'att_102',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      department: 'Software Engineering',
      date: '2025-10-29',
      checkIn: '10:00',
      checkOut: '19:00',
      workHours: '09:00',
      extraHours: '01:00',
      status: 'Present',
    },
    {
      id: 'att_103',
      employeeId: 'usr_emp_03',
      employeeName: 'John Doe',
      department: 'Product Management',
      date: '2025-10-29',
      checkIn: '10:15',
      checkOut: '18:45',
      workHours: '08:30',
      extraHours: '00:30',
      status: 'Late',
    },
  ],
  isCheckedIn: false,
  checkInTime: null,
  checkInTimestamp: null,
  isLoading: false,

  fetchAttendance: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/attendance/history');
      if (response.data && Array.isArray(response.data)) {
        set({ records: response.data });
      }
    } catch (error: any) {
      // Offline fallback
    } finally {
      set({ isLoading: false });
    }
  },

  fetchToday: async () => {
    try {
      const response = await api.get('/attendance/today');
      if (response.data && response.data.checkIn) {
        set({
          isCheckedIn: true,
          checkInTime: response.data.checkIn,
          checkInTimestamp: Date.now() - 3600000,
        });
      }
    } catch (error: any) {
      // Keep current state
    }
  },

  checkIn: async () => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowTimestamp = Date.now();
    try {
      await api.post('/attendance/punch-in');
    } catch (error: any) {
      // Offline fallback
    } finally {
      const todayDate = new Date().toISOString().split('T')[0];
      const newRec: AttendanceRecord = {
        id: `att_${Date.now()}`,
        employeeId: 'usr_emp_02',
        employeeName: 'Alex Rivera',
        department: 'Software Engineering',
        date: todayDate,
        checkIn: nowTime,
        status: 'Present',
        workHours: '00:00:01',
        extraHours: '00:00',
      };

      set((state) => ({
        isCheckedIn: true,
        checkInTime: nowTime,
        checkInTimestamp: nowTimestamp,
        records: [newRec, ...state.records],
        isLoading: false,
      }));
      snackbar.success(`Successfully checked IN at ${nowTime}!`);
    }
  },

  checkOut: async () => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post('/attendance/punch-out');
    } catch (error: any) {
      // Offline fallback
    } finally {
      set((state) => ({
        isCheckedIn: false,
        checkInTime: null,
        checkInTimestamp: null,
        records: state.records.map((r, idx) =>
          idx === 0 ? { ...r, checkOut: nowTime, workHours: '08:30', extraHours: '00:30' } : r
        ),
        isLoading: false,
      }));
      snackbar.info('Successfully checked OUT.');
    }
  },

  addAttendanceRecord: (rec) => {
    set((state) => ({
      records: [{ ...rec, id: `att_${Date.now()}` }, ...state.records],
    }));
  },

  // Alias implementations for compatibility
  punchIn: async () => get().checkIn(),
  punchOut: async () => get().checkOut(),
  checkTodayAttendance: async () => get().fetchToday(),
}));
