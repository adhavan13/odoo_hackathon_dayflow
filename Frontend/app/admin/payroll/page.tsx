"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, FilePlus2, Search } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PayrollError,
  PayrollLoading,
  PayrollShell,
  PayrollSlip,
  Metric,
  money,
} from "@/components/payroll/payroll-ui";

export default function AdminPayrollPage() {
  const router = useRouter();
  const [month, setMonth] = useState("2026-08");
  const [search, setSearch] = useState("");
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/payroll/slips", { params: { month } });
        setSlips((response.data as PayrollSlip[]) || []);
      } catch (requestError: any) {
        setError(requestError.message || "Unable to load payroll.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [month]);

  const visibleSlips = slips.filter((slip) =>
    `${slip.employeeName} ${slip.employeeId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <PayrollShell
      title="Payroll"
      subtitle="Review employee payroll and attendance-based payable days"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-accent" />
          <Input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="h-9 w-44"
          />
        </div>
        <Button
          type="button"
          className="gap-2"
          disabled
          title="Payroll generation API is not available yet"
        >
          <FilePlus2 className="h-4 w-4" />
          Generate Payroll
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Payroll Records" value={slips.length} icon={FilePlus2} />
        <Metric
          label="Paid Records"
          value={slips.filter((slip) => slip.status === "paid").length}
          icon={FilePlus2}
          accent="bg-emerald-500/15 text-emerald-600"
        />
        <Metric label="Selected Month" value={month} icon={CalendarDays} />
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employee..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>
      {loading ? (
        <PayrollLoading />
      ) : error ? (
        <PayrollError message={error} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Payable Days</th>
                <th className="p-4">Gross Salary</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visibleSlips.length ? (
                visibleSlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-muted/30">
                    <td className="p-4 font-semibold">{slip.employeeName}</td>
                    <td className="p-4 text-muted-foreground">
                      {slip.employeeId}
                    </td>
                    <td className="p-4">{slip.payableDays ?? "--"}</td>
                    <td className="p-4">{money(slip.grossSalary)}</td>
                    <td className="p-4">{money(slip.deductions)}</td>
                    <td className="p-4 font-bold">{money(slip.netPay)}</td>
                    <td className="p-4 capitalize">{slip.status}</td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/payroll/${slip.employeeId}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </PayrollShell>
  );
}
