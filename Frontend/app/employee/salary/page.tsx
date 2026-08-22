"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { EmployeeSalaryHubView } from "@/components/payroll/EmployeeSalaryHubView";
import { useAuthStore } from "@/store";

export default function EmployeeSalaryPage() {
  const { user } = useAuthStore();

  return (
    <PageContainer
      title="My Salary & Payslip Hub"
      subtitle="View your salary structure breakup, monthly payslips, annual YTD earnings, and tax documents"
      badge="Employee View"
    >
      <EmployeeSalaryHubView
        employeeId={user?.id || user?.employeeId || "usr_emp_02"}
        employeeName={user?.name || "Alex Rivera"}
      />
    </PageContainer>
  );
}
