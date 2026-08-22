import { getDatabase } from "../config/database";
import { ApiError } from "../utils/apiError";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInTimestamp?: number | null;
  workSummaryNote?: string | null;
  status: AttendanceStatus;
  workMinutes: number;
  breakMinutes: number;
  extraMinutes: number;
  attendanceSource: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AttendanceBreak {
  id: string;
  attendanceId: string;
  employeeId: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  createdAt: Date;
}

const getAttendance = () =>
  getDatabase().collection<AttendanceLog>("attendance");
const getBreaks = () =>
  getDatabase().collection<AttendanceBreak>("attendance_breaks");
const dateString = (date = new Date()) => date.toISOString().slice(0, 10);
const timeString = (date = new Date()) => date.toISOString().slice(11, 16);
const getMonth = (value?: string) =>
  value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
    ? value
    : dateString().slice(0, 7);
const toMinutes = (value: string | null) =>
  value ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : 0;
const formatMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const workingDaysInMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  let total = 0;
  for (let day = 1; day <= days; day += 1) {
    const weekday = new Date(year, monthNumber - 1, day).getDay();
    if (weekday !== 0 && weekday !== 6) total += 1;
  }
  return total;
};

const addDisplayTimes = (record: AttendanceLog) => ({
  ...record,
  workHours: formatMinutes(record.workMinutes),
  breakHours: formatMinutes(record.breakMinutes),
  extraHours: formatMinutes(record.extraMinutes),
});

const makeSummary = (records: AttendanceLog[], totalWorkingDays: number) => ({
  totalWorkingDays,
  daysPresent: records.filter((record) => record.status === "PRESENT").length,
  daysAbsent: records.filter((record) => record.status === "ABSENT").length,
  daysOnLeave: records.filter((record) => record.status === "LEAVE").length,
  totalWorkHours: formatMinutes(
    records.reduce((total, record) => total + record.workMinutes, 0),
  ),
  totalExtraHours: formatMinutes(
    records.reduce((total, record) => total + record.extraMinutes, 0),
  ),
});

export class AttendanceService {
  static async setup() {
    await getAttendance().createIndex(
      { employeeId: 1, date: 1 },
      { unique: true },
    );
    await getBreaks().createIndex({ employeeId: 1, endTime: 1 });
  }

  private static async findToday(employeeId: string) {
    return getAttendance().findOne({ employeeId, date: dateString() });
  }

  static async checkIn(
    employeeId: string,
    employeeName = "Employee",
    source = "ASSIGNED_ATTENDANCE",
  ) {
    const now = new Date();
    const existing = await getAttendance().findOne({
      employeeId,
      date: dateString(now),
    });
    if (existing?.checkIn && !existing?.checkOut)
      throw new ApiError(409, "You are currently checked in.");
    if (existing) {
      await getAttendance().updateOne(
        { id: existing.id },
        {
          $set: {
            checkIn: timeString(now),
            checkOut: null,
            checkInTimestamp: now.getTime(),
            status: "PRESENT",
            updatedAt: now,
          },
        },
      );
      return {
        ...existing,
        checkIn: timeString(now),
        checkOut: null,
        checkInTimestamp: now.getTime(),
        status: "PRESENT" as AttendanceStatus,
      };
    }
    const record: AttendanceLog = {
      id: makeId("att"),
      employeeId,
      employeeName,
      date: dateString(now),
      checkIn: timeString(now),
      checkOut: null,
      checkInTimestamp: now.getTime(),
      workSummaryNote: null,
      status: "PRESENT",
      workMinutes: 0,
      breakMinutes: 0,
      extraMinutes: 0,
      attendanceSource: source,
      createdAt: now,
      updatedAt: now,
    };
    await getAttendance().insertOne(record);
    return record;
  }

  static async checkOut(employeeId: string, workSummaryNote?: string) {
    const record = await this.findToday(employeeId);
    if (!record?.checkIn || record.checkOut)
      throw new ApiError(400, "You are not currently checked in.");
    const checkOut = timeString();
    const sessionWorkMinutes = Math.max(
      0,
      toMinutes(checkOut) - toMinutes(record.checkIn) - record.breakMinutes,
    );
    const newTotalWorkMinutes = (record.workMinutes || 0) + sessionWorkMinutes;
    const updated = {
      checkOut,
      workMinutes: newTotalWorkMinutes,
      extraMinutes: Math.max(0, newTotalWorkMinutes - 8 * 60),
      workSummaryNote: workSummaryNote || record.workSummaryNote || null,
      updatedAt: new Date(),
    };
    await getAttendance().updateOne({ id: record.id }, { $set: updated });
    return addDisplayTimes({ ...record, ...updated });
  }

  static async startBreak(employeeId: string) {
    const record = await this.findToday(employeeId);
    if (!record?.checkIn || record.checkOut)
      throw new ApiError(400, "An active attendance session is required.");
    if (await getBreaks().findOne({ employeeId, endTime: null }))
      throw new ApiError(409, "A break is already active.");
    const breakRecord: AttendanceBreak = {
      id: makeId("break"),
      attendanceId: record.id,
      employeeId,
      startTime: timeString(),
      endTime: null,
      durationMinutes: 0,
      createdAt: new Date(),
    };
    await getBreaks().insertOne(breakRecord);
    return breakRecord;
  }

  static async endBreak(employeeId: string) {
    const activeBreak = await getBreaks().findOne({
      employeeId,
      endTime: null,
    });
    if (!activeBreak) throw new ApiError(400, "No active break found.");
    const endTime = timeString();
    const durationMinutes = Math.max(
      0,
      toMinutes(endTime) - toMinutes(activeBreak.startTime),
    );
    await getBreaks().updateOne(
      { id: activeBreak.id },
      { $set: { endTime, durationMinutes } },
    );
    const breaks = await getBreaks()
      .find({ attendanceId: activeBreak.attendanceId })
      .toArray();
    const breakMinutes = breaks.reduce(
      (total, item) =>
        total +
        (item.id === activeBreak.id ? durationMinutes : item.durationMinutes),
      0,
    );
    await getAttendance().updateOne(
      { id: activeBreak.attendanceId },
      { $set: { breakMinutes, updatedAt: new Date() } },
    );
    return {
      ...activeBreak,
      endTime,
      durationMinutes,
      duration: formatMinutes(durationMinutes),
    };
  }

  static async getTodayStatus(employeeId: string) {
    const record = await this.findToday(employeeId);
    return {
      date: dateString(),
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      checkInTimestamp: record?.checkInTimestamp || (record?.createdAt ? new Date(record.createdAt).getTime() : null),
      workSummaryNote: record?.workSummaryNote || null,
      status: record?.status || "ABSENT",
      workHours: formatMinutes(record?.workMinutes || 0),
      breakHours: formatMinutes(record?.breakMinutes || 0),
      extraHours: formatMinutes(record?.extraMinutes || 0),
      isCheckedIn: Boolean(record?.checkIn && !record.checkOut),
      isCheckedOut: Boolean(record?.checkOut),
    };
  }

  static async getMyAttendance(employeeId: string, month?: string) {
    const selectedMonth = getMonth(month);
    const records = await getAttendance()
      .find({ employeeId, date: { $regex: `^${selectedMonth}` } })
      .sort({ date: 1 })
      .toArray();
    return {
      month: selectedMonth,
      summary: makeSummary(records, workingDaysInMonth(selectedMonth)),
      attendance: records.map(addDisplayTimes),
    };
  }

  static async getTodayForAdmin(
    search?: string,
    date?: string,
    status?: string,
    department?: string,
  ) {
    const query: Record<string, unknown> = {
      date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : dateString(),
    };
    if (search) query.employeeName = { $regex: search, $options: "i" };
    if (status && status !== "all")
      query.status =
        status.toUpperCase() === "ON LEAVE"
          ? "LEAVE"
          : status.toUpperCase().replace(" ", "_");
    if (department && department !== "all") query.department = department;
    const records = await getAttendance().find(query).toArray();
    const employees = await getDatabase()
      .collection<{
        id: string;
        name: string;
        department?: string;
      }>("employees")
      .find({})
      .toArray();
    const enrichedRecords = records.map((record) => {
      const employee = employees.find(
        (candidate) =>
          candidate.id === record.employeeId ||
          candidate.name === record.employeeName,
      );
      return employee ? { ...record, department: employee.department } : record;
    });
    const filteredRecords =
      department && department !== "all"
        ? enrichedRecords.filter((record) => record.department === department)
        : enrichedRecords;
    const totalEmployees = await getDatabase()
      .collection("employees")
      .countDocuments();
    return {
      date: dateString(),
      summary: {
        totalEmployees,
        present: filteredRecords.filter((record) => record.status === "PRESENT")
          .length,
        absent: Math.max(0, totalEmployees - filteredRecords.length),
        onLeave: filteredRecords.filter((record) => record.status === "LEAVE")
          .length,
      },
      attendance: filteredRecords.map(addDisplayTimes),
    };
  }

  static async getEmployeeAttendance(employeeId: string, month?: string) {
    const result = await this.getMyAttendance(employeeId, month);
    const employee = await getDatabase()
      .collection("employees")
      .findOne({ $or: [{ id: employeeId }, { employeeCode: employeeId }] });
    return {
      employee: employee
        ? { id: employee.id, name: employee.name }
        : { id: employeeId, name: "Employee" },
      summary: result.summary,
      attendance: result.attendance,
    };
  }

  static async getPayableDays(employeeId: string, month?: string) {
    const selectedMonth = getMonth(month);
    const records = await getAttendance()
      .find({ employeeId, date: { $regex: `^${selectedMonth}` } })
      .toArray();
    const totalWorkingDays = workingDaysInMonth(selectedMonth);
    const presentDays = records.filter(
      (record) => record.status === "PRESENT",
    ).length;
    const leaveRequests = await getDatabase()
      .collection<{
        type: string;
        startDate: string;
        days: number;
        status: string;
      }>("leave_requests")
      .find({
        employeeId,
        status: "approved",
        startDate: { $regex: `^${selectedMonth}` },
      })
      .toArray();
    const paidLeaveDays = leaveRequests
      .filter((leave) => leave.type !== "unpaid")
      .reduce((total, leave) => total + leave.days, 0);
    const unpaidLeaveDays = leaveRequests
      .filter((leave) => leave.type === "unpaid")
      .reduce((total, leave) => total + leave.days, 0);
    const missingAttendanceDays = Math.max(
      0,
      totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays,
    );
    return {
      employeeId,
      month: selectedMonth,
      totalWorkingDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      missingAttendanceDays,
      payableDays: Math.max(
        0,
        totalWorkingDays - unpaidLeaveDays - missingAttendanceDays,
      ),
    };
  }

  static async getHistory(employeeId?: string) {
    return getAttendance()
      .find(employeeId ? { employeeId } : {})
      .sort({ date: -1 })
      .toArray();
  }
}
