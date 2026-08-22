"use client";

import React from "react";
import { Filter, Calendar } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

interface FinancialYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  labelPrefix?: string;
}

export const FY_OPTIONS = [
  { label: "2026 - 27", value: "2026-27" },
  { label: "2025 - 26", value: "2025-26" },
  { label: "2024 - 25", value: "2024-25" },
];

export function FinancialYearSelect({
  value,
  onChange,
  className = "",
  labelPrefix = "Financial Year",
}: FinancialYearSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Filter className="h-3.5 w-3.5 text-accent shrink-0" />
      <span className="text-xs font-semibold text-foreground shrink-0">
        {labelPrefix} :
      </span>
      <CustomSelect
        value={value}
        onValueChange={onChange}
        options={FY_OPTIONS}
        className="w-32 h-8 text-xs font-bold font-mono"
      />
    </div>
  );
}
