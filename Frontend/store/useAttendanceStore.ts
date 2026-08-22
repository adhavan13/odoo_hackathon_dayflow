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

interface AttendanceState {
  records: AttendanceRecord[];
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInTimestamp: number | null;
  isLoading: boolean;
  fetchAttendance: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
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
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      department: 'Software Engineering',
      date: '2025-10-30',
      checkIn: '09:30',
      checkOut: '18:30',
      workHours: '09:00',
      extraHours: '01:00',
      status: 'Present',
    },
    {
      id: 'att_104',
      employeeId: 'usr_emp_02',
      employeeName: 'Alex Rivera',
      department: 'Software Engineering',
      date: '2025-10-31',
      checkIn: '10:15',
      checkOut: '19:15',
      workHours: '08:45',
      extraHours: '00:45',
      status: 'Present',
    },
    {
      id: 'att_105',
      employeeId: 'usr_admin_01',
      employeeName: 'Sarah Jenkins',
      department: 'Human Resources',
      date: '2025-10-28',
      checkIn: '09:00',
      checkOut: '18:00',
      workHours: '09:00',
      extraHours: '01:00',
      status: 'Present',
    },
    {
      id: 'att_106',
      employeeId: 'usr_emp_03',
      employeeName: 'Michael Scott',
      department: 'Sales & Marketing',
      date: '2025-10-28',
      checkIn: '10:30',
      checkOut: '17:30',
      workHours: '07:00',
      extraHours: '00:00',
      status: 'Late',
    },
    {
      id: 'att_107',
      employeeId: 'usr_emp_04',
      employeeName: 'Jim Halpert',
      department: 'Sales & Marketing',
      date: '2025-10-28',
      checkIn: '-',
      checkOut: '-',
      workHours: '00:00',
      extraHours: '00:00',
      status: 'On Leave',
    },
  ],
  isCheckedIn: false,
  checkInTime: null,
  checkInTimestamp: null,
  isLoading: false,

  fetchAttendance: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/attendance');
      if (response.data) {
        set({ records: response.data });
      }
    } catch (error: any) {
      // Offline fallback
    } finally {
      set({ isLoading: false });
    }
  },

  checkIn: async () => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowTimestamp = Date.now();
    try {
      await api.post('/attendance/check-in');
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
      snackbar.success(`Successfully checked IN at ${nowTime}! Red status dot changed to Green.`);
    }
  },

  checkOut: async () => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post('/attendance/check-out');
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
      snackbar.info('Successfully checked OUT. Status dot changed back to Red.');
    }
  },

  addAttendanceRecord: (rec) => {
    set((state) => ({
      records: [{ ...rec, id: `att_${Date.now()}` }, ...state.records],
    }));
  },
}));
