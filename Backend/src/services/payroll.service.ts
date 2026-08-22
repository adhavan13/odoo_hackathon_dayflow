import { getDatabase } from "../config/database";

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
  status: "paid" | "pending" | "processing";
  generatedDate: string;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  wageType: 'Fixed wage';
  monthlyWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  hoursPerWeek: number;
  
  basicPercent: number;
  hraPercent: number;
  standardAllowance: number;
  performanceBonusPercent: number;
  ltaPercent: number;
  
  pfEmployeePercent: number;
  pfEmployerPercent: number;
  professionalTax: number;
}

const seedSlips: SalarySlip[] = [
  {
    id: "slp_01",
    employeeId: "emp_1",
    employeeName: "Alex Rivera",
    month: "July",
    year: 2026,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1600,
    deductions: 800,
    netPay: 9200,
    status: "paid",
    generatedDate: "2026-07-31",
  },
  {
    id: "slp_02",
    employeeId: "emp_1",
    employeeName: "Alex Rivera",
    month: "June",
    year: 2026,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1600,
    deductions: 800,
    netPay: 9200,
    status: "paid",
    generatedDate: "2026-06-30",
  },
];

export class PayrollService {
  private static collection() {
    return getDatabase().collection<SalarySlip>("salary_slips");
  }

  private static async ensureSeedData() {
    const collection = this.collection();
    if ((await collection.countDocuments()) === 0)
      await collection.insertMany(seedSlips);
  }

  static async getSalarySlips(employeeId?: string) {
    await this.ensureSeedData();
    return this.collection()
      .find(employeeId ? { employeeId } : {})
      .toArray();
  }

  static calculateComponents(structure: SalaryStructure) {
    const basic = (structure.monthlyWage * structure.basicPercent) / 100;
    const hra = (basic * structure.hraPercent) / 100;
    const performanceBonus = (basic * structure.performanceBonusPercent) / 100;
    const lta = (basic * structure.ltaPercent) / 100;
    const standardAllowance = structure.standardAllowance;
    const subtotal = basic + hra + performanceBonus + lta + standardAllowance;
    const fixedAllowance = Math.max(0, structure.monthlyWage - subtotal);
    
    const pfEmployee = (basic * structure.pfEmployeePercent) / 100;
    const pfEmployer = (basic * structure.pfEmployerPercent) / 100;
    
    return {
      ...structure,
      calculated: {
        basic,
        hra,
        performanceBonus,
        lta,
        standardAllowance,
        fixedAllowance,
        pfEmployee,
        pfEmployer,
        professionalTax: structure.professionalTax,
        netPay: structure.monthlyWage - pfEmployee - structure.professionalTax
      }
    };
  }

  static async getSalaryStructure(employeeId: string) {
    await this.ensureSeedData();
    const structure = await getDatabase().collection<SalaryStructure>('salary_structures').findOne({ employeeId });
    if (!structure) {
      return this.calculateComponents({
        id: `struct_${Date.now()}`,
        employeeId,
        wageType: 'Fixed wage',
        monthlyWage: 50000,
        yearlyWage: 600000,
        workingDaysPerWeek: 5,
        hoursPerWeek: 40,
        basicPercent: 50,
        hraPercent: 50,
        standardAllowance: 4167,
        performanceBonusPercent: 8.33,
        ltaPercent: 8.33,
        pfEmployeePercent: 12,
        pfEmployerPercent: 12,
        professionalTax: 200
      });
    }
    return this.calculateComponents(structure);
  }

  static async updateSalaryStructure(employeeId: string, data: Partial<SalaryStructure>) {
    const collection = getDatabase().collection<SalaryStructure>('salary_structures');
    const existing = await collection.findOne({ employeeId });
    if (existing) {
      await collection.updateOne({ employeeId }, { $set: data });
    } else {
      await collection.insertOne({
        id: `struct_${Date.now()}`,
        employeeId,
        wageType: 'Fixed wage',
        monthlyWage: 50000,
        yearlyWage: 600000,
        workingDaysPerWeek: 5,
        hoursPerWeek: 40,
        basicPercent: 50,
        hraPercent: 50,
        standardAllowance: 4167,
        performanceBonusPercent: 8.33,
        ltaPercent: 8.33,
        pfEmployeePercent: 12,
        pfEmployerPercent: 12,
        professionalTax: 200,
        ...data,
      });
    }
    return this.getSalaryStructure(employeeId);
  }

  static async getPayrollOverview() {
    await this.ensureSeedData();
    return {
      totalPayrollMonth: "$145,200",
      totalEmployeesPaid: 34,
      pendingApprovals: 2,
      nextPayDate: "2026-08-31",
      recentSlips: await this.collection().find({}).toArray(),
    };
  }
}
