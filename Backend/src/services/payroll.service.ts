import { getDatabase } from "../config/database";
import { ApiError } from "../utils/apiError";
import { AttendanceService } from "./attendance.service";

export type PayrollStatus = "DRAFT" | "GENERATED" | "FINALIZED";
export interface SalaryStructure {
  id: string;
  employeeId: string;
  companyId?: string;
  wageType: "Fixed wage";
  monthlyWage: number;
  yearlyWage?: number;
  workingDaysPerWeek?: number;
  hoursPerWeek?: number;
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  otherDeduction: number;
  basicPercent?: number;
  hraPercent?: number;
  standardAllowance?: number;
  performanceBonusPercent?: number;
  ltaPercent?: number;
  pfEmployeePercent?: number;
  pfEmployerPercent?: number;
  professionalTax?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface PayrollItem {
  id: string;
  payrollId: string;
  type: "EARNING" | "DEDUCTION";
  name: string;
  amount: number;
  createdAt: Date;
}
export interface Payroll {
  id: string;
  employeeId: string;
  companyId?: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  missingAttendanceDays: number;
  payableDays: number;
  grossSalary: number;
  payableSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const structures = () =>
  getDatabase().collection<SalaryStructure>("salary_structures");
const payrolls = () => getDatabase().collection<Payroll>("payrolls");
const items = () => getDatabase().collection<PayrollItem>("payroll_items");
const employees = () => getDatabase().collection<any>("employees");
const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
const validPeriod = (month: unknown, year: unknown) => {
  const m = Number(month);
  const y = Number(year);
  if (
    !Number.isInteger(m) ||
    m < 1 ||
    m > 12 ||
    !Number.isInteger(y) ||
    y < 2000 ||
    y > 2100
  )
    throw new ApiError(400, "Valid month and year are required.");
  return { month: m, year: y };
};
const monthName = (month: number) =>
  new Date(2000, month - 1, 1).toLocaleString("en-US", { month: "long" });
const employeeFilter = (employeeId: string, companyId?: string) => ({
  $or: [{ id: employeeId }, { employeeCode: employeeId }],
  ...(companyId ? { companyId } : {}),
});

const defaultStructure = (
  employeeId: string,
  companyId?: string,
): SalaryStructure => ({
  id: makeId("struct"),
  employeeId,
  companyId,
  wageType: "Fixed wage",
  monthlyWage: 50000,
  basicSalary: 25000,
  hra: 12500,
  transportAllowance: 2500,
  medicalAllowance: 2000,
  otherAllowance: 3000,
  pfDeduction: 3000,
  taxDeduction: 200,
  otherDeduction: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export class PayrollService {
  static async setup() {
    await payrolls().createIndex(
      { employeeId: 1, month: 1, year: 1 },
      { unique: true },
    );
    await structures().createIndex({ employeeId: 1 }, { unique: true });
    await items().createIndex({ payrollId: 1 });
  }

  static async getSalaryStructure(employeeId: string, companyId?: string) {
    const found = await structures().findOne({
      employeeId,
      ...(companyId ? { companyId } : {}),
    });
    return found || defaultStructure(employeeId, companyId);
  }

  static async updateSalaryStructure(
    employeeId: string,
    data: Partial<SalaryStructure>,
    companyId?: string,
  ) {
    const allowed = [
      "basicSalary",
      "hra",
      "transportAllowance",
      "medicalAllowance",
      "otherAllowance",
      "pfDeduction",
      "taxDeduction",
      "otherDeduction",
    ];
    for (const key of allowed)
      if (
        data[key as keyof SalaryStructure] !== undefined &&
        (!Number.isFinite(Number(data[key as keyof SalaryStructure])) ||
          Number(data[key as keyof SalaryStructure]) < 0)
      )
        throw new ApiError(400, `${key} must be a non-negative number.`);
    const current = await this.getSalaryStructure(employeeId, companyId);
    const next = {
      ...current,
      ...Object.fromEntries(
        allowed.map((key) => [
          key,
          data[key as keyof SalaryStructure] ??
            current[key as keyof SalaryStructure],
        ]),
      ),
      updatedAt: new Date(),
    } as SalaryStructure;
    const componentTotal =
      next.basicSalary +
      next.hra +
      next.transportAllowance +
      next.medicalAllowance +
      next.otherAllowance;
    if (componentTotal > next.monthlyWage)
      throw new ApiError(
        400,
        "Salary components cannot exceed the defined wage.",
      );
    await structures().replaceOne(
      { employeeId, ...(companyId ? { companyId } : {}) },
      next,
      { upsert: true },
    );
    return next;
  }

  static async getPayroll(
    employeeId: string,
    month: number,
    year: number,
    companyId?: string,
  ) {
    return payrolls().findOne({
      employeeId,
      month,
      year,
      ...(companyId ? { companyId } : {}),
    });
  }

  static async generateForEmployee(
    employeeId: string,
    month: number,
    year: number,
    companyId?: string,
  ) {
    const existing = await this.getPayroll(employeeId, month, year, companyId);
    if (existing?.status === "FINALIZED")
      throw new ApiError(
        409,
        `Payroll already finalized for ${monthName(month)} ${year}.`,
      );
    const structure = await this.getSalaryStructure(employeeId, companyId);
    const attendance = await AttendanceService.getMyAttendance(
      employeeId,
      `${year}-${String(month).padStart(2, "0")}`,
    );
    const summary = attendance.summary;
    const leaveRequests = await getDatabase()
      .collection<any>("leave_requests")
      .find({
        employeeId,
        status: "approved",
        startDate: { $regex: `^${year}-${String(month).padStart(2, "0")}` },
      })
      .toArray();
    const paidLeaveDays = leaveRequests
      .filter((leave) => leave.type !== "unpaid")
      .reduce((total, leave) => total + Number(leave.days || 0), 0);
    const unpaidLeaveDays = leaveRequests
      .filter((leave) => leave.type === "unpaid")
      .reduce((total, leave) => total + Number(leave.days || 0), 0);
    const presentDays = summary.daysPresent;
    const missingAttendanceDays = Math.max(
      0,
      summary.totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays,
    );
    const payableDays = presentDays + paidLeaveDays;
    const grossSalary =
      structure.basicSalary +
      structure.hra +
      structure.transportAllowance +
      structure.medicalAllowance +
      structure.otherAllowance;
    const payableSalary =
      Math.round(
        (grossSalary * payableDays * 100) /
          Math.max(1, summary.totalWorkingDays),
      ) / 100;
    const totalDeductions =
      structure.pfDeduction + structure.taxDeduction + structure.otherDeduction;
    const now = new Date();
    const payroll: Payroll = {
      id: existing?.id || makeId("pay"),
      employeeId,
      companyId,
      month,
      year,
      workingDays: summary.totalWorkingDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      absentDays: summary.daysAbsent,
      missingAttendanceDays,
      payableDays,
      grossSalary,
      payableSalary,
      totalDeductions,
      netSalary: payableSalary - totalDeductions,
      status: "GENERATED",
      generatedAt: now,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await payrolls().replaceOne({ employeeId, month, year }, payroll, {
      upsert: true,
    });
    await items().deleteMany({ payrollId: payroll.id });
    const values: PayrollItem[] = [
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "EARNING",
        name: "Basic Salary",
        amount: structure.basicSalary,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "EARNING",
        name: "HRA",
        amount: structure.hra,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "EARNING",
        name: "Transport Allowance",
        amount: structure.transportAllowance,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "EARNING",
        name: "Medical Allowance",
        amount: structure.medicalAllowance,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "EARNING",
        name: "Other Allowance",
        amount: structure.otherAllowance,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "DEDUCTION",
        name: "PF",
        amount: structure.pfDeduction,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "DEDUCTION",
        name: "Tax",
        amount: structure.taxDeduction,
        createdAt: now,
      },
      {
        id: makeId("item"),
        payrollId: payroll.id,
        type: "DEDUCTION",
        name: "Other Deduction",
        amount: structure.otherDeduction,
        createdAt: now,
      },
    ];
    await items().insertMany(values);
    return { ...payroll, items: values };
  }

  static async generate(
    monthValue: unknown,
    yearValue: unknown,
    companyId?: string,
  ) {
    const { month, year } = validPeriod(monthValue, yearValue);
    const list = await employees()
      .find({
        status: { $ne: "terminated" },
        ...(companyId ? { companyId } : {}),
      })
      .toArray();
    return Promise.all(
      list.map((employee) =>
        this.generateForEmployee(employee.id, month, year, companyId),
      ),
    );
  }
  static async getAll(
    monthValue: unknown,
    yearValue: unknown,
    companyId?: string,
    search?: string,
  ) {
    const { month, year } = validPeriod(monthValue, yearValue);
    const query: any = { month, year, ...(companyId ? { companyId } : {}) };
    if (search) query.employeeName = { $regex: search, $options: "i" };
    return payrolls().find(query).sort({ updatedAt: -1 }).toArray();
  }
  static async getById(id: string, companyId?: string) {
    const payroll = await payrolls().findOne({
      id,
      ...(companyId ? { companyId } : {}),
    });
    if (!payroll) throw new ApiError(404, "Payroll not found.");
    return {
      ...payroll,
      items: await items().find({ payrollId: id }).toArray(),
    };
  }
  static async getEmployee(
    employeeId: string,
    monthValue: unknown,
    yearValue: unknown,
    companyId?: string,
  ) {
    const { month, year } = validPeriod(monthValue, yearValue);
    const payroll = await this.getPayroll(employeeId, month, year, companyId);
    return payroll
      ? {
          ...payroll,
          items: await items().find({ payrollId: payroll.id }).toArray(),
          salaryStructure: await this.getSalaryStructure(employeeId, companyId),
        }
      : null;
  }
  static async finalize(id: string, companyId?: string) {
    const payroll = await this.getById(id, companyId);
    if (payroll.status === "FINALIZED")
      throw new ApiError(409, "Payroll is already finalized.");
    await payrolls().updateOne(
      { id },
      { $set: { status: "FINALIZED", updatedAt: new Date() } },
    );
    return { ...payroll, status: "FINALIZED" as PayrollStatus };
  }
  static async payslip(id: string, companyId?: string) {
    const payroll = await this.getById(id, companyId);
    const employee = await employees().findOne({ id: payroll.employeeId });
    const company = payroll.companyId
      ? await getDatabase()
          .collection("companies")
          .findOne({ id: payroll.companyId })
      : null;
    return { company, employee, payroll };
  }
  static async getSalarySlips(employeeId?: string) {
    const list = await payrolls()
      .find(employeeId ? { employeeId } : {})
      .toArray();
    return list.length ? list : [];
  }
  static async getPayrollOverview() {
    const list = await payrolls().find({}).toArray();
    return {
      totalPayrollMonth: list.reduce((sum, item) => sum + item.netSalary, 0),
      totalEmployeesPaid: list.filter((item) => item.status !== "DRAFT").length,
      pendingApprovals: list.filter((item) => item.status === "DRAFT").length,
      recentSlips: list,
    };
  }
}
