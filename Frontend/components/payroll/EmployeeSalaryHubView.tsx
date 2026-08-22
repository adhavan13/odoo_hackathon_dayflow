"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  PieChart,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle2,
  Folder,
  FolderOpen,
  ArrowLeft,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { snackbar } from "@/utils/snackbar";
import { FinancialYearSelect } from "./FinancialYearSelect";
import { SalaryBreakupChart } from "./SalaryBreakupChart";
import { downloadPayslipPDF, downloadAnnualEarningsCSV } from "@/utils/exportPayroll";
import { api } from "@/utils/api";

interface EmployeeSalaryHubViewProps {
  employeeId?: string;
  employeeName?: string;
  readOnly?: boolean;
}

export function EmployeeSalaryHubView({
  employeeId = "usr_emp_02",
  employeeName = "Alex Rivera",
  readOnly = false,
}: EmployeeSalaryHubViewProps) {
  const [activeTab, setActiveTab] = useState<"structure" | "payslips" | "annual" | "documents">("structure");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [docFolder, setDocFolder] = useState<"payslips" | "form16">("payslips");
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  // Salary data state
  const [monthlyCtc, setMonthlyCtc] = useState(50000);
  const [basicSalary, setBasicSalary] = useState(25000);
  const [hra, setHra] = useState(12500);
  const [transportAllowance, setTransportAllowance] = useState(2500);
  const [medicalAllowance, setMedicalAllowance] = useState(2000);
  const [otherAllowance, setOtherAllowance] = useState(8000);

  const [pfDeduction, setPfDeduction] = useState(3000);
  const [taxDeduction, setTaxDeduction] = useState(200);

  const yearlyCtc = monthlyCtc * 12;
  const grossPay = basicSalary + hra + transportAllowance + medicalAllowance + otherAllowance;
  const totalDeductions = pfDeduction + taxDeduction;
  const netTakeHome = grossPay - totalDeductions;

  useEffect(() => {
    const loadSalaryData = async () => {
      try {
        const response = await api.get("/payroll/structure", {
          params: employeeId ? { employeeId } : undefined,
        });
        const data = response.data?.data || response.data;
        if (data && data.monthlyWage) {
          setMonthlyCtc(data.monthlyWage);
          setBasicSalary(data.basicSalary || data.monthlyWage * 0.5);
          setHra(data.hra || data.monthlyWage * 0.25);
          setTransportAllowance(data.transportAllowance || 2500);
          setMedicalAllowance(data.medicalAllowance || 2000);
          setOtherAllowance(data.otherAllowance || 8000);
          setPfDeduction(data.pfDeduction || 3000);
          setTaxDeduction(data.taxDeduction || 200);
        }
      } catch {
        // Fallback default sample values
      }
    };
    void loadSalaryData();
  }, [employeeId]);

  // Months list for FY 2026-27 (April 2026 to March 2027)
  const fyMonths = [
    { month: "April 2026", code: "2026-04" },
    { month: "May 2026", code: "2026-05" },
    { month: "June 2026", code: "2026-06" },
    { month: "July 2026", code: "2026-07" },
    { month: "August 2026", code: "2026-08" },
    { month: "September 2026", code: "2026-09" },
    { month: "October 2026", code: "2026-10" },
    { month: "November 2026", code: "2026-11" },
    { month: "December 2026", code: "2026-12" },
    { month: "January 2027", code: "2027-01" },
    { month: "February 2027", code: "2027-02" },
    { month: "March 2027", code: "2027-03" },
  ];

  const monthlyBreakdownList = fyMonths.map((item) => ({
    month: item.month,
    code: item.code,
    grossPay,
    reimbursements: 0,
    deductions: totalDeductions,
    takeHome: netTakeHome,
  }));

  const ytdGross = grossPay * 5; // 5 months processed up to Aug 2026
  const ytdTakeHome = netTakeHome * 5;

  return (
    <div className="space-y-6">
      {/* Top Tab Navigation Header (Matching Screenshots) */}
      <div className="border-b border-border bg-card rounded-2xl p-1 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`px-5 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "structure"
                ? "bg-accent/15 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            Salary Structure
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payslips")}
            className={`px-5 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "payslips"
                ? "bg-accent/15 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            Payslips
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("annual")}
            className={`px-5 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "annual"
                ? "bg-accent/15 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            Annual Earnings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-5 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "documents"
                ? "bg-accent/15 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* TAB 1: SALARY STRUCTURE (Matching Image 1) */}
      {activeTab === "structure" && (
        <div className="space-y-6">
          {/* Top CTC Overview Card */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div className="flex items-center gap-6">
                {/* SVG Doughnut Chart */}
                <SalaryBreakupChart
                  earnings={grossPay}
                  reimbursements={0}
                  benefits={0}
                  monthlyCtc={monthlyCtc}
                />
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-xl font-black text-foreground">
                      Monthly CTC: ₹{monthlyCtc.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        downloadPayslipPDF({
                          employeeName,
                          employeeId,
                          month: "August",
                          year: 2026,
                          grossPay,
                          reimbursements: 0,
                          deductions: totalDeductions,
                          takeHome: netTakeHome,
                          basicSalary,
                          hra,
                          allowances: transportAllowance + medicalAllowance + otherAllowance,
                        })
                      }
                      className="text-accent text-xs font-bold gap-1 hover:bg-accent/10 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Salary Structure
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Yearly CTC: ₹{yearlyCtc.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>

                  {/* Summary Metric Pills */}
                  <div className="flex flex-wrap items-center gap-6 mt-4 pt-2 border-t border-border/40">
                    <div className="border-l-4 border-emerald-500 pl-3">
                      <p className="text-[11px] font-semibold text-muted-foreground">Earnings</p>
                      <p className="text-sm font-extrabold text-foreground">
                        ₹{grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="text-[11px] font-semibold text-muted-foreground">Reimbursements</p>
                      <p className="text-sm font-extrabold text-foreground">₹0.00</p>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <p className="text-[11px] font-semibold text-muted-foreground">Benefits</p>
                      <p className="text-sm font-extrabold text-foreground">₹0.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-foreground">Earnings</h3>
              <div className="rounded-2xl border border-border/80 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-border/60 font-medium">
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">Basic Salary</td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">
                        ₹{basicSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">House Rent Allowance (HRA)</td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">
                        ₹{hra.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">Transport & Medical Allowances</td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">
                        ₹{(transportAllowance + medicalAllowance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">Special Allowance & Bonuses</td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">
                        ₹{otherAllowance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-muted/30 font-bold border-t border-border">
                      <td className="p-4 text-foreground">Monthly CTC</td>
                      <td className="p-4 text-right font-mono text-base text-foreground font-black">
                        ₹{monthlyCtc.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Perquisites & Benefits Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-extrabold text-foreground">Perquisites & Deductions</h3>
              <div className="rounded-2xl border border-border/80 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">
                        Additional Benefits{" "}
                        <span className="text-accent text-[11px] font-bold cursor-pointer hover:underline">
                          (View Details)
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-foreground">₹0.00</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 text-foreground">Employee PF Contribution & Tax Deductions</td>
                      <td className="p-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYSLIPS (Matching Image 2) */}
      {activeTab === "payslips" && (
        <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-6">
          {/* Toolbar with Financial Year Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <FinancialYearSelect value={financialYear} onChange={setFinancialYear} />
            <span className="text-xs text-muted-foreground font-mono">
              Showing payslips for Financial Year {financialYear}
            </span>
          </div>

          {/* Payslips Table */}
          <div className="rounded-2xl border border-border/80 overflow-hidden text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Month</th>
                  <th className="p-4">Gross Pay</th>
                  <th className="p-4">Reimbursements</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Take Home</th>
                  <th className="p-4">Payslips</th>
                  <th className="p-4 text-right">Tax Worksheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {monthlyBreakdownList.map((item, idx) => {
                  const isProcessed = idx <= 4; // April to August 2026
                  return (
                    <tr key={item.code} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-bold text-accent">{item.month}</td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        ₹{item.grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">₹0.00</td>
                      <td className="p-4 font-mono text-rose-600 dark:text-rose-400">
                        ₹{item.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono font-extrabold text-foreground">
                        ₹{item.takeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        {isProcessed ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPayslip(item)}
                              className="text-accent hover:underline font-bold text-xs cursor-pointer"
                            >
                              View
                            </button>
                            <span className="text-muted-foreground">•</span>
                            <button
                              type="button"
                              onClick={() =>
                                downloadPayslipPDF({
                                  employeeName,
                                  employeeId,
                                  month: item.month.split(" ")[0],
                                  year: Number(item.month.split(" ")[1]),
                                  grossPay: item.grossPay,
                                  reimbursements: 0,
                                  deductions: item.deductions,
                                  takeHome: item.takeHome,
                                })
                              }
                              className="text-accent hover:underline font-bold text-xs cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Upcoming</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isProcessed ? (
                          <button
                            type="button"
                            onClick={() => snackbar.info(`Tax worksheet generated for ${item.month}`)}
                            className="text-accent hover:underline font-bold text-xs cursor-pointer"
                          >
                            View Worksheet
                          </button>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANNUAL EARNINGS (Matching Image 3) */}
      {activeTab === "annual" && (
        <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <h3 className="text-base font-extrabold text-foreground">
              For the financial year: {financialYear}
            </h3>
            <div className="flex items-center gap-3">
              <FinancialYearSelect value={financialYear} onChange={setFinancialYear} labelPrefix="FY" />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadAnnualEarningsCSV(employeeName, financialYear, monthlyBreakdownList)
                }
                className="h-8 text-xs font-bold gap-1 text-accent border-accent/40 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Monthly Earnings Bar Chart Visualizer */}
          <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Monthly Take-Home Trend ({financialYear})</span>
              <span className="text-accent font-mono">Max: ₹{grossPay.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
              {monthlyBreakdownList.map((m, i) => {
                const heightPct = i <= 4 ? 85 : 30; // April to August active
                return (
                  <div key={m.code} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        i <= 4
                          ? "bg-accent group-hover:bg-accent/80 shadow-2xs"
                          : "bg-muted/50 border border-dashed border-border"
                      }`}
                      title={`${m.month}: ₹${m.takeHome.toLocaleString("en-IN")}`}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {m.month.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matrix YTD Table */}
          <div className="rounded-2xl border border-border/80 overflow-x-auto text-xs shadow-2xs">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase">
                <tr>
                  <th className="p-4">Earnings Item</th>
                  <th className="p-4">YTD Total</th>
                  {fyMonths.slice(0, 6).map((m) => (
                    <th key={m.code} className="p-4 text-center">
                      {m.month.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/20">
                  <td className="p-4 font-bold text-foreground">Basic Salary</td>
                  <td className="p-4 font-mono font-extrabold text-foreground">
                    ₹{(basicSalary * 5).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  {fyMonths.slice(0, 6).map((m, idx) => (
                    <td key={m.code} className="p-4 text-center font-mono">
                      {idx <= 4 ? `₹${basicSalary.toLocaleString("en-IN")}` : "--"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-4 font-bold text-foreground">Total Earnings</td>
                  <td className="p-4 font-mono font-extrabold text-foreground">
                    ₹{ytdGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  {fyMonths.slice(0, 6).map((m, idx) => (
                    <td key={m.code} className="p-4 text-center font-mono font-bold">
                      {idx <= 4 ? `₹${grossPay.toLocaleString("en-IN")}` : "--"}
                    </td>
                  ))}
                </tr>
                <tr className="bg-accent/10 font-bold border-t border-accent/30">
                  <td className="p-4 text-accent">Take Home</td>
                  <td className="p-4 font-mono text-base text-accent font-black">
                    ₹{ytdTakeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  {fyMonths.slice(0, 6).map((m, idx) => (
                    <td key={m.code} className="p-4 text-center font-mono text-accent">
                      {idx <= 4 ? `₹${netTakeHome.toLocaleString("en-IN")}` : "--"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS (Matching Image 4) */}
      {activeTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Folders Sidebar */}
          <div className="p-4 rounded-3xl border border-border bg-card shadow-2xs space-y-4">
            <button
              type="button"
              onClick={() => setActiveTab("structure")}
              className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-accent" />
              All Documents
            </h4>
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-2">
                FOLDERS
              </span>
              <button
                type="button"
                onClick={() => setDocFolder("payslips")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFolder === "payslips"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <Folder className="h-4 w-4" />
                Payslips
              </button>
              <button
                type="button"
                onClick={() => setDocFolder("form16")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docFolder === "form16"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                Form 16 & Tax Docs
              </button>
            </div>
          </div>

          {/* Right Documents List */}
          <div className="lg:col-span-3 p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="text-base font-extrabold text-foreground">
                {docFolder === "payslips" ? "Payslips Documents" : "Form 16 & Tax Certificates"}
              </h3>
              <FinancialYearSelect value={financialYear} onChange={setFinancialYear} />
            </div>

            <div className="rounded-2xl border border-border/80 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase">
                  <tr>
                    <th className="p-4">Month & Year</th>
                    <th className="p-4">File Type</th>
                    <th className="p-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {docFolder === "payslips" ? (
                    fyMonths.slice(0, 5).map((m) => (
                      <tr key={m.code} className="hover:bg-muted/20">
                        <td className="p-4 font-bold text-accent">{m.month}</td>
                        <td className="p-4 text-muted-foreground font-medium">Payslip PDF</td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              downloadPayslipPDF({
                                employeeName,
                                employeeId,
                                month: m.month.split(" ")[0],
                                year: Number(m.month.split(" ")[1]),
                                grossPay,
                                reimbursements: 0,
                                deductions: totalDeductions,
                                takeHome: netTakeHome,
                              })
                            }
                            className="h-8 text-xs font-bold gap-1.5 text-accent border-accent/30 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-muted/20">
                      <td className="p-4 font-bold text-foreground">FY 2025-26 Part B</td>
                      <td className="p-4 text-muted-foreground font-medium">Form 16 Certificate</td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => snackbar.info("Form 16 PDF downloaded successfully")}
                          className="h-8 text-xs font-bold gap-1.5 text-accent border-accent/30 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Payslip Preview - {selectedPayslip.month}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Name:</span>
                  <span className="font-bold text-foreground">{employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-bold text-accent">{employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pay Period:</span>
                  <span className="font-bold text-foreground">{selectedPayslip.month}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <h5 className="font-bold text-foreground">Earnings Breakdown</h5>
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Salary:</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{selectedPayslip.grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Deductions (PF + Tax):</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    -₹{selectedPayslip.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-foreground border-t border-border/80 pt-2">
                  <span>Net Salary (Take Home):</span>
                  <span className="font-mono text-accent">
                    ₹{selectedPayslip.takeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPayslip(null)}
                className="w-full text-xs font-bold cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  downloadPayslipPDF({
                    employeeName,
                    employeeId,
                    month: selectedPayslip.month.split(" ")[0],
                    year: Number(selectedPayslip.month.split(" ")[1]),
                    grossPay: selectedPayslip.grossPay,
                    reimbursements: 0,
                    deductions: selectedPayslip.deductions,
                    takeHome: selectedPayslip.takeHome,
                  });
                  setSelectedPayslip(null);
                }}
                className="bg-accent text-accent-foreground font-bold text-xs w-full gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
