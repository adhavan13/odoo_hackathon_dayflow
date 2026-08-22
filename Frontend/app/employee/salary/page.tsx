"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import {
  Breakdown,
  PayrollError,
  PayrollLoading,
  PayrollShell,
  SalaryStructure,
  StructureFields,
} from "@/components/payroll/payroll-ui";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function EmployeeSalaryPage() {
  const [month, setMonth] = useState("2026-08");
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [slip, setSlip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [structureResponse, slipsResponse] = await Promise.all([
          api.get("/payroll/structure"),
          api.get("/payroll/slips"),
        ]);
        setStructure(structureResponse.data as SalaryStructure);
        const slips = (slipsResponse.data as any[]) || [];
        setSlip(
          slips.find(
            (item) =>
              `${item.year}-${String(new Date(`${item.month} 1, ${item.year}`).getMonth() + 1).padStart(2, "0")}` ===
              month,
          ) ||
            slips[0] ||
            null,
        );
      } catch (requestError: any) {
        setError(requestError.message || "Unable to load your salary.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [month]);
  return (
    <PayrollShell
      title="My Salary"
      subtitle="View your salary structure and payroll information"
    >
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-accent" />
        <Input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="h-9 w-44"
        />
      </div>
      {loading ? (
        <PayrollLoading />
      ) : error ? (
        <PayrollError message={error} />
      ) : structure ? (
        <>
          <section className="rounded-xl border border-border bg-card p-5 shadow-2xs">
            <h2 className="mb-4 text-sm font-bold">Salary Structure</h2>
            <StructureFields structure={structure} readOnly />
          </section>
          <Breakdown structure={structure} slip={slip} />
        </>
      ) : (
        <PayrollError message="Salary structure is not available." />
      )}
    </PayrollShell>
  );
}
