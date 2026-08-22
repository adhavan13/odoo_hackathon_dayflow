import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut?: string | null;
  workHours?: string;
  breakHours?: string;
  extraHours?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
}

export interface AttendanceSummary {
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysOnLeave: number;
  totalWorkHours: string;
  totalExtraHours: string;
}

export interface AttendanceState {
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
  fetchAttendance: (month?: string) => Promise<void>;
  fetchToday: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  isPunchedIn?: boolean;
  todayRecord?: { inTime?: string; outTime?: string };
  checkTodayAttendance?: () => Promise<void>;
  punchIn?: () => Promise<void>;
  punchOut?: () => Promise<void>;
}

const normalizeStatus = (status?: string): AttendanceRecord['status'] => {
  switch (status?.toUpperCase()) {
    case 'LEAVE': return 'On Leave';
    case 'HALF_DAY': return 'Half Day';
    case 'ABSENT': return 'Absent';
    default: return 'Present';
  }
};

const formatTime = (value?: string | null) => {
  if (!value) return value || null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const normalizeRecord = (record: any): AttendanceRecord => ({
  id: record.id || record._id,
  employeeId: record.employeeId,
  employeeName: record.employeeName || 'Employee',
  date: record.date,
  checkIn: formatTime(record.checkIn),
  checkOut: formatTime(record.checkOut),
  workHours: record.workHours || '00:00',
  breakHours: record.breakHours || '00:00',
  extraHours: record.extraHours || '00:00',
  status: normalizeStatus(record.status),
});

const errorMessage = (error: any) => error?.message || 'Attendance request failed.';

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  summary: null,
  isCheckedIn: false,
  checkInTime: null,
  checkInTimestamp: null,
  isLoading: false,
  error: null,

  fetchAttendance: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/attendance/me', { params: month ? { month } : undefined });
      const result = response.data as any;
      set({ records: (result?.attendance || []).map(normalizeRecord), summary: result?.summary || null });
    } catch (error: any) {
      set({ error: errorMessage(error) });
      snackbar.error(errorMessage(error));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchToday: async () => {
    try {
      const response = await api.get('/attendance/me/today');
      const today = (response.data as any)?.attendance || response.data;
      set({ isCheckedIn: Boolean(today?.isCheckedIn), checkInTime: today?.checkIn || null, checkInTimestamp: today?.checkIn ? Date.now() : null });
    } catch (error: any) {
      set({ error: errorMessage(error) });
      snackbar.error(errorMessage(error));
    }
  },

  checkIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/attendance/check-in', { source: 'ASSIGNED_ATTENDANCE' });
      const record = normalizeRecord((response.data as any)?.attendance || response.data);
      set((state) => ({ isCheckedIn: true, checkInTime: record.checkIn, checkInTimestamp: Date.now(), records: [record, ...state.records.filter((item) => item.date !== record.date)] }));
      snackbar.success(`Successfully checked IN at ${record.checkIn || 'now'}!`);
    } catch (error: any) {
      set({ error: errorMessage(error) });
      snackbar.error(errorMessage(error));
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/attendance/check-out', {});
      const record = normalizeRecord((response.data as any)?.attendance || response.data);
      set((state) => ({ isCheckedIn: false, checkInTime: null, checkInTimestamp: null, records: state.records.map((item) => item.date === record.date ? record : item) }));
      snackbar.info('Successfully checked OUT.');
    } catch (error: any) {
      set({ error: errorMessage(error) });
      snackbar.error(errorMessage(error));
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  startBreak: async () => {
    try {
      await api.post('/attendance/break/start', {});
      snackbar.success('Break started.');
    } catch (error: any) {
      snackbar.error(errorMessage(error));
      throw error;
    }
  },

  endBreak: async () => {
    try {
      await api.post('/attendance/break/end', {});
      await get().fetchToday();
      snackbar.success('Break ended.');
    } catch (error: any) {
      snackbar.error(errorMessage(error));
      throw error;
    }
  },

  addAttendanceRecord: (record) => set((state) => ({ records: [{ ...record, id: `att_${Date.now()}` }, ...state.records] })),
  punchIn: async () => get().checkIn(),
  punchOut: async () => get().checkOut(),
  checkTodayAttendance: async () => get().fetchToday(),
}));
