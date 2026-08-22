export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  hoursWorked: number;
}

let attendanceLogs: AttendanceLog[] = [
  {
    id: 'att_01',
    employeeId: 'emp_1',
    employeeName: 'Alex Rivera',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    status: 'present',
    hoursWorked: 8.5,
  },
  {
    id: 'att_02',
    employeeId: 'emp_2',
    employeeName: 'Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:45 AM',
    checkOut: '05:00 PM',
    status: 'present',
    hoursWorked: 8.25,
  },
  {
    id: 'att_03',
    employeeId: 'emp_3',
    employeeName: 'Michael Chen',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:30 AM',
    status: 'late',
    hoursWorked: 4.5,
  },
];

export class AttendanceService {
  static async checkIn(employeeId: string, employeeName = 'Alex Rivera') {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existing = attendanceLogs.find(
      (l) => l.employeeId === employeeId && l.date === today
    );

    if (existing) {
      existing.checkIn = nowTime;
      return existing;
    }

    const newLog: AttendanceLog = {
      id: `att_${Date.now()}`,
      employeeId,
      employeeName,
      date: today,
      checkIn: nowTime,
      status: 'present',
      hoursWorked: 0,
    };

    attendanceLogs.unshift(newLog);
    return newLog;
  }

  static async checkOut(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const log = attendanceLogs.find(
      (l) => l.employeeId === employeeId && l.date === today
    );

    if (log) {
      log.checkOut = nowTime;
      log.hoursWorked = 8.0;
      return log;
    }

    const newLog: AttendanceLog = {
      id: `att_${Date.now()}`,
      employeeId,
      employeeName: 'Alex Rivera',
      date: today,
      checkIn: '09:00 AM',
      checkOut: nowTime,
      status: 'present',
      hoursWorked: 8.0,
    };

    attendanceLogs.unshift(newLog);
    return newLog;
  }

  static async getTodayStatus(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const log = attendanceLogs.find(
      (l) => l.employeeId === employeeId && l.date === today
    );

    return {
      date: today,
      isCheckedIn: !!log?.checkIn && !log?.checkOut,
      isCheckedOut: !!log?.checkOut,
      checkInTime: log?.checkIn || null,
      checkOutTime: log?.checkOut || null,
      hoursWorked: log?.hoursWorked || 0,
      status: log?.status || 'absent',
    };
  }

  static async getHistory(employeeId?: string) {
    if (employeeId) {
      return attendanceLogs.filter((l) => l.employeeId === employeeId);
    }
    return attendanceLogs;
  }
}
