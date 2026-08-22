import { connectDatabase, closeDatabase, getDatabase } from '../config/database';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';
import { AttendanceService } from '../services/attendance.service';
import { LeaveService } from '../services/leave.service';
import { PayrollService } from '../services/payroll.service';

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully.');

    const db = getDatabase();

    // The services already have private seed data logic, but it's only triggered when a method is called.
    // We will call dummy methods or explicit seed functions if we could, but they are private.
    // However, calling 'getAllEmployees', 'getLeaveRequests', etc. triggers the seed logic inside them!
    
    console.log('Seeding Users (Auth)...');
    try {
      await AuthService.login('invalid@example.com', 'invalid');
    } catch (e) {
      // Ignore login error, the seedUsers is called inside login()
    }

    console.log('Seeding Employees...');
    await EmployeeService.getAllEmployees();

    console.log('Seeding Attendance...');
    await AttendanceService.getHistory();

    console.log('Seeding Leaves & Balances...');
    await LeaveService.getLeaveRequests();
    await LeaveService.getLeaveBalance('emp_1');
    await LeaveService.getLeaveBalance('emp_2');
    await LeaveService.getLeaveBalance('emp_3');

    console.log('Seeding Payroll & Salary Slips...');
    await PayrollService.getSalarySlips();
    
    // Seed Salary Structure explicitly using the new method
    console.log('Seeding Salary Structure...');
    await PayrollService.updateSalaryStructure('emp_1', {
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

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
};

seed();
