"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { EmployeeSalaryHubView } from "@/components/payroll/EmployeeSalaryHubView";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmployeeStore } from "@/store";

export default function AdminPayrollEmployeePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { employees } = useEmployeeStore();

  const emp = employees.find((e) => e.id === id || e.loginId === id) || {
    id: id || "usr_emp_02",
    name: "Alex Rivera",
  };

  return (
    <PageContainer
      title={`Payroll Details — ${emp.name}`}
      subtitle={`Comprehensive salary structure, payslips, annual YTD breakdown, and documents for ${emp.name} (${emp.id})`}
      badge="Admin / HR Payroll View"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/payroll")}
            className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payroll Batch List
          </Button>

          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground font-mono">
            <UserCheck className="h-4 w-4 text-accent" />
            Employee ID: <span className="text-foreground">{emp.id}</span>
          </div>
        </div>

        <EmployeeSalaryHubView employeeId={emp.id} employeeName={emp.name} />
      </div>
    </PageContainer>
  );
}
