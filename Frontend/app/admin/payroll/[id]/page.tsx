"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Pencil, Save, UserRound } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  Breakdown,
  PayrollError,
  PayrollLoading,
  PayrollShell,
  SalaryStructure,
  StructureFields,
} from "@/components/payroll/payroll-ui";

export default function AdminPayrollEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/payroll/structure", {
          params: { employeeId: id },
        });
        setStructure(response.data as SalaryStructure);
      } catch (requestError: any) {
        setError(requestError.message || "Unable to load salary structure.");
      } finally {
        setLoading(false);
      }
    };
    if (id) void load();
  }, [id]);
  const save = async () => {
    if (!structure) return;
    try {
      const response = await api.put("/payroll/structure", {
        ...structure,
        employeeId: id,
      });
      setStructure(response.data as SalaryStructure);
      setEditing(false);
    } catch (requestError: any) {
      setError(requestError.message || "Unable to update salary structure.");
    }
  };
  return (
    <PayrollShell
      title="Employee Payroll"
      subtitle="Review and manage salary structure"
    >
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">Employee payroll</p>
            <p className="text-xs text-muted-foreground">Employee ID: {id}</p>
          </div>
        </div>
        {!editing ? (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Salary Structure
          </Button>
        ) : (
          <Button onClick={() => void save()} className="gap-2">
            <Save className="h-4 w-4" />
            Save Structure
          </Button>
        )}
      </div>
      {loading ? (
        <PayrollLoading />
      ) : error ? (
        <PayrollError message={error} />
      ) : structure ? (
        <>
          <section className="rounded-xl border border-border bg-card p-5 shadow-2xs">
            <h2 className="mb-4 text-sm font-bold">Salary Structure</h2>
            <StructureFields
              structure={structure}
              setStructure={setStructure}
              readOnly={!editing}
            />
          </section>
          <Breakdown structure={structure} />
        </>
      ) : null}
    </PayrollShell>
  );
}
