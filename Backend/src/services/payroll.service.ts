import { getDatabase } from '../config/database';

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
  generatedDate: string;
}

export interface SalaryStructure {
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
}

const seedSlips: SalarySlip[] = [
  {
    id: 'slp_01',
    employeeId: 'emp_1',
    employeeName: 'Alex Rivera',
    month: 'July',
    year: 2026,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1600,
    deductions: 800,
    netPay: 9200,
    status: 'paid',
    generatedDate: '2026-07-31',
  },
  {
    id: 'slp_02',
    employeeId: 'emp_1',
    employeeName: 'Alex Rivera',
    month: 'June',
    year: 2026,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1600,
    deductions: 800,
    netPay: 9200,
    status: 'paid',
    generatedDate: '2026-06-30',
  },
];

export class PayrollService {
  private static collection() { return getDatabase().collection<SalarySlip>('salary_slips'); }

  private static async ensureSeedData() {
    const collection = this.collection();
    if (await collection.countDocuments() === 0) await collection.insertMany(seedSlips);
  }

  static async getSalarySlips(employeeId?: string) {
    await this.ensureSeedData();
    return this.collection().find(employeeId ? { employeeId } : {}).toArray();
  }

  static async getSalaryStructure(employeeId: string): Promise<SalaryStructure> {
    return {
      employeeId,
      basicSalary: 6000,
      hra: 2400,
      conveyance: 800,
      medicalAllowance: 800,
      pfDeduction: 500,
      taxDeduction: 300,
      grossSalary: 10000,
      netSalary: 9200,
    };
  }

  static async getPayrollOverview() {
    await this.ensureSeedData();
    return {
      totalPayrollMonth: '$145,200',
      totalEmployeesPaid: 34,
      pendingApprovals: 2,
      nextPayDate: '2026-08-31',
      recentSlips: await this.collection().find({}).toArray(),
    };
  }
}
