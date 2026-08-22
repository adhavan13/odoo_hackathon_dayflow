import { getDatabase } from '../config/database';

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

const seedAttendanceLogs: AttendanceLog[] = [
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
  private static collection() { return getDatabase().collection<AttendanceLog>('attendance'); }

  private static async ensureSeedData() {
    const collection = this.collection();
    if (await collection.countDocuments() === 0) await collection.insertMany(seedAttendanceLogs);
  }

  static async checkIn(employeeId: string, employeeName = 'Alex Rivera') {
    await this.ensureSeedData();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const collection = this.collection();
    const existing = await collection.findOne({ employeeId, date: today });

    if (existing) {
      await collection.updateOne({ id: existing.id }, { $set: { checkIn: nowTime } });
      return { ...existing, checkIn: nowTime };
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

    await collection.insertOne(newLog);
    return newLog;
  }

  static async checkOut(employeeId: string) {
    await this.ensureSeedData();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const collection = this.collection();
    const log = await collection.findOne({ employeeId, date: today });

    if (log) {
      await collection.updateOne({ id: log.id }, { $set: { checkOut: nowTime, hoursWorked: 8.0 } });
      return { ...log, checkOut: nowTime, hoursWorked: 8.0 };
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

    await collection.insertOne(newLog);
    return newLog;
  }

  static async getTodayStatus(employeeId: string) {
    await this.ensureSeedData();
    const today = new Date().toISOString().split('T')[0];
    const log = await this.collection().findOne({ employeeId, date: today });

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
    await this.ensureSeedData();
    return this.collection().find(employeeId ? { employeeId } : {}).toArray();
  }
}
