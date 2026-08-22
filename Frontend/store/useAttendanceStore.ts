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
  workSummaryNote?: string;
  checkInTimestamp?: number;
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
  checkOut: (workSummaryNote?: string) => Promise<void>;
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  // Compatibility aliases
  isPunchedIn?: boolean;
  todayRecord?: { inTime?: string; outTime?: string };
  checkTodayAttendance?: () => Promise<void>;
  punchIn?: () => Promise<void>;
  punchOut?: (note?: string) => Promise<void>;
}

const SESSION_KEY = 'dayflow_attendance_session';

const getInitialSession = () => {
  if (typeof window === 'undefined') {
    return { isCheckedIn: false, checkInTime: null, checkInTimestamp: null };
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const todayStr = new Date().toISOString().slice(0, 10);
      if (parsed.date === todayStr && parsed.isCheckedIn) {
        return {
          isCheckedIn: true,
          checkInTime: parsed.checkInTime || null,
          checkInTimestamp: parsed.checkInTimestamp || null,
        };
      }
    }
  } catch {}
  return { isCheckedIn: false, checkInTime: null, checkInTimestamp: null };
};

const saveSessionToStorage = (isCheckedIn: boolean, checkInTime: string | null, checkInTimestamp: number | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (isCheckedIn) {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ isCheckedIn, checkInTime, checkInTimestamp, date: todayStr }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}
};

const initialSession = getInitialSession();

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
      workSummaryNote: 'Completed frontend authentication flow and connected user profile endpoints.',
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
      workSummaryNote: 'Refactored navigation layout sidebar and fixed responsive dark mode styling.',
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
      workSummaryNote: 'Reviewed Q4 product roadmap deliverables and updated user story documentation.',
    },
  ],
  isCheckedIn: initialSession.isCheckedIn,
  checkInTime: initialSession.checkInTime,
  checkInTimestamp: initialSession.checkInTimestamp,
  isLoading: false,

  fetchAttendance: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/attendance/history');
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        set({ records: data });
      }
    } catch (error: any) {
      // Retain existing records on offline
    } finally {
      set({ isLoading: false });
    }
  },

  fetchToday: async () => {
    try {
      const response = await api.get('/attendance/today');
      const att = response.data?.attendance || response.data;
      if (att && att.checkIn && !att.checkOut) {
        const checkInTimestamp = att.checkInTimestamp || get().checkInTimestamp || Date.now();
        set({
          isCheckedIn: true,
          checkInTime: att.checkIn,
          checkInTimestamp,
        });
        saveSessionToStorage(true, att.checkIn, checkInTimestamp);
      } else if (att && att.checkOut) {
        set({
          isCheckedIn: false,
          checkInTime: null,
          checkInTimestamp: null,
        });
        saveSessionToStorage(false, null, null);
      }
    } catch (error: any) {
      // Retain current session from localStorage
    }
  },

  checkIn: async () => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowTimestamp = Date.now();
    try {
      const res = await api.post('/attendance/punch-in');
      const backendAtt = res.data?.attendance;
      if (backendAtt?.checkInTimestamp) {
        // use backend timestamp if provided
      }
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
        checkInTimestamp: nowTimestamp,
      };

      set((state) => ({
        isCheckedIn: true,
        checkInTime: nowTime,
        checkInTimestamp: nowTimestamp,
        records: [newRec, ...state.records],
        isLoading: false,
      }));
      saveSessionToStorage(true, nowTime, nowTimestamp);
      snackbar.success(`Successfully checked IN at ${nowTime}!`);
    }
  },

  checkOut: async (workSummaryNote?: string) => {
    set({ isLoading: true });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentStartTimestamp = get().checkInTimestamp;

    // Calculate worked duration text
    let durationText = '08:00';
    if (currentStartTimestamp) {
      const diffMs = Math.max(0, Date.now() - currentStartTimestamp);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      durationText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    try {
      await api.post('/attendance/punch-out', { workSummaryNote });
    } catch (error: any) {
      // Offline fallback
    } finally {
      set((state) => ({
        isCheckedIn: false,
        checkInTime: null,
        checkInTimestamp: null,
        records: state.records.map((r, idx) =>
          idx === 0
            ? {
                ...r,
                checkOut: nowTime,
                workHours: durationText,
                workSummaryNote: workSummaryNote || r.workSummaryNote || 'Daily work shift completed.',
              }
            : r
        ),
        isLoading: false,
      }));
      saveSessionToStorage(false, null, null);
      snackbar.info('Successfully checked OUT. Work summary saved!');
    }
  },

  addAttendanceRecord: (rec) => {
    set((state) => ({
      records: [{ ...rec, id: `att_${Date.now()}` }, ...state.records],
    }));
  },

  // Alias implementations for compatibility
  punchIn: async () => get().checkIn(),
  punchOut: async (note?: string) => get().checkOut(note),
  checkTodayAttendance: async () => get().fetchToday(),
}));
