"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  PayrollError,
  PayrollLoading,
  PayrollShell,
  PayslipView,
  PayrollSlip,
} from "@/components/payroll/payroll-ui";

export default function AdminPayslipPage() {
  const { id } = useParams<{ id: string }>();
  const [slip, setSlip] = useState<PayrollSlip | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/payroll/slips");
        const found = ((response.data as PayrollSlip[]) || []).find(
          (item) => item.id === id,
        );
        if (!found) throw new Error("Payslip not found.");
        setSlip(found);
      } catch (requestError: any) {
        setError(requestError.message || "Unable to load payslip.");
      }
    };
    if (id) void load();
  }, [id]);
  return (
    <PayrollShell
      title="Employee Payslip"
      subtitle="Review employee payroll payslip"
    >
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={!slip}
          className="gap-2"
          title="PDF generation API is not available yet"
        >
          <Download className="h-4 w-4" />
          Download Payslip
        </Button>
      </div>
      {error ? (
        <PayrollError message={error} />
      ) : slip ? (
        <PayslipView slip={slip} />
      ) : (
        <PayrollLoading />
      )}
    </PayrollShell>
  );
}
