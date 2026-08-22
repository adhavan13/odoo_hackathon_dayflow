/**
 * Utility functions for exporting Payroll data as PDF / CSV downloads
 */

export interface ExportPayslipData {
  employeeName: string;
  employeeId: string;
  month: string;
  year: number;
  grossPay: number;
  reimbursements: number;
  deductions: number;
  takeHome: number;
  basicSalary?: number;
  hra?: number;
  allowances?: number;
}

export function downloadPayslipPDF(data: ExportPayslipData) {
  const content = `================================================================================
                           DAYFLOW HRMS - PAYSLIP
================================================================================
Employee Name : ${data.employeeName}
Employee ID   : ${data.employeeId}
Period        : ${data.month} ${data.year}
Generated On  : ${new Date().toLocaleDateString("en-IN")}
--------------------------------------------------------------------------------
EARNINGS BREAKDOWN:
  Basic Salary         : ₹${(data.basicSalary || data.grossPay * 0.5).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
  House Rent (HRA)     : ₹${(data.hra || data.grossPay * 0.25).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
  Other Allowances     : ₹${(data.allowances || data.grossPay * 0.25).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
--------------------------------------------------------------------------------
TOTAL GROSS EARNINGS   : ₹${data.grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
REIMBURSEMENTS         : ₹${data.reimbursements.toLocaleString("en-IN", { minimumFractionDigits: 2 })}

DEDUCTIONS:
  Provident Fund (PF)  : ₹${(data.deductions > 200 ? data.deductions - 200 : data.deductions).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
  Professional Tax (PT): ₹${(data.deductions > 200 ? 200 : 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
TOTAL DEDUCTIONS       : ₹${data.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
--------------------------------------------------------------------------------
NET TAKE HOME SALARY   : ₹${data.takeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
================================================================================
This is a computer-generated payslip from Dayflow HRMS Suite.
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Payslip_${data.employeeName.replace(/\s+/g, "_")}_${data.month}_${data.year}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAnnualEarningsCSV(
  employeeName: string,
  financialYear: string,
  monthlyRows: any[]
) {
  const headers = ["Month", "Gross Pay", "Reimbursements", "Deductions", "Take Home"];
  const csvLines = [
    `Employee Name,${employeeName}`,
    `Financial Year,${financialYear}`,
    "",
    headers.join(","),
    ...monthlyRows.map((r) =>
      [r.month, r.grossPay, r.reimbursements, r.deductions, r.takeHome].join(",")
    ),
  ];

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Annual_Earnings_${employeeName.replace(/\s+/g, "_")}_${financialYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
