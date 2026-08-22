"use client";

import { ReactNode } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Users,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PayrollSlip = {
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
  status: string;
  generatedDate: string;
  payableDays?: number;
  grossSalary?: number;
};

export type SalaryStructure = Record<string, any>;

export const money = (value?: number) =>
  typeof value === "number"
    ? value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })
    : "--";
export const monthValue = (month: string, year: number) =>
  `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, "0")}`;

export function PayrollLoading() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      Loading payroll data...
    </div>
  );
}
export function PayrollError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-600">
      <AlertCircle className="mr-2 inline h-4 w-4" />
      {message}
    </div>
  );
}
export function Metric({
  label,
  value,
  icon: Icon,
  accent = "bg-accent/15 text-accent",
}: {
  label: string;
  value: string | number;
  icon: any;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function Breakdown({
  structure,
  slip,
}: {
  structure: SalaryStructure;
  slip?: PayrollSlip | null;
}) {
  const calculated = structure?.calculated || {};
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Banknote className="h-4 w-4 text-accent" />
          Earnings
        </h2>
        <div className="space-y-3 text-sm">
          <Row
            label="Basic Salary"
            value={money(slip?.basicSalary ?? calculated.basic)}
          />
          <Row label="HRA" value={money(slip?.hra ?? calculated.hra)} />
          <Row label="Allowances" value={money(slip?.allowances)} />
          <Row strong label="Gross Salary" value={money(slip?.grossSalary)} />
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <FileText className="h-4 w-4 text-accent" />
          Deductions
        </h2>
        <div className="space-y-3 text-sm">
          <Row label="PF" value={money(calculated.pfEmployee)} />
          <Row label="Tax" value={money(calculated.professionalTax)} />
          <Row label="Other Deductions" value="--" />
          <Row
            strong
            label="Total Deductions"
            value={money(slip?.deductions)}
          />
        </div>
      </section>
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-accent">Net Salary</span>
          <span className="text-2xl font-extrabold text-foreground">
            {money(slip?.netPay ?? calculated.netPay)}
          </span>
        </div>
      </div>
    </div>
  );
}
function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between border-b border-border/60 pb-2 ${strong ? "font-bold text-foreground" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function StructureFields({
  structure,
  setStructure,
  readOnly = false,
}: {
  structure: SalaryStructure;
  setStructure?: (value: SalaryStructure) => void;
  readOnly?: boolean;
}) {
  const fields = [
    ["monthlyWage", "Monthly Wage"],
    ["yearlyWage", "Yearly Wage"],
    ["basicPercent", "Basic Salary %"],
    ["hraPercent", "HRA %"],
    ["standardAllowance", "Standard Allowance"],
    ["performanceBonusPercent", "Performance Bonus %"],
    ["ltaPercent", "LTA %"],
    ["pfEmployeePercent", "PF Deduction %"],
    ["professionalTax", "Professional Tax"],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <label
          key={key}
          className="space-y-1.5 text-xs font-semibold text-muted-foreground"
        >
          {label}
          <Input
            type="number"
            disabled={readOnly}
            value={structure[key] ?? ""}
            onChange={(event) =>
              setStructure?.({
                ...structure,
                [key]: Number(event.target.value),
              })
            }
            className="h-9 text-sm text-foreground"
          />
        </label>
      ))}
    </div>
  );
}

export function PayslipView({ slip }: { slip: PayrollSlip }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-extrabold">Dayflow HRMS</p>
          <p className="text-xs text-muted-foreground">Salary payslip</p>
        </div>
        <div className="text-left text-sm sm:text-right">
          <p className="font-bold">{slip.employeeName}</p>
          <p className="text-xs text-muted-foreground">{slip.employeeId}</p>
        </div>
      </div>
      <div className="grid gap-3 border-b border-border py-5 text-sm sm:grid-cols-3">
        <Row label="Payroll Period" value={`${slip.month} ${slip.year}`} />
        <Row label="Generated Date" value={slip.generatedDate} />
        <Row label="Status" value={slip.status} />
      </div>
      <Breakdown structure={{}} slip={slip} />
    </div>
  );
}

export function PayrollShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <PageContainer title={title} subtitle={subtitle} badge="Payroll">
      <div className="space-y-6">{children}</div>
    </PageContainer>
  );
}
