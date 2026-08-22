"use client";

import React from "react";

interface SalaryBreakupChartProps {
  earnings: number;
  reimbursements: number;
  benefits: number;
  monthlyCtc: number;
}

export function SalaryBreakupChart({
  earnings,
  reimbursements,
  benefits,
  monthlyCtc,
}: SalaryBreakupChartProps) {
  // Compute chart proportions
  const total = (earnings + reimbursements + benefits) || monthlyCtc || 1;
  const earningsPct = Math.round((earnings / total) * 100);
  const reimbursementsPct = Math.round((reimbursements / total) * 100);
  const benefitsPct = 100 - earningsPct - reimbursementsPct;

  // SVG Circumference calculation
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(earningsPct / 100) * circumference} ${circumference}`;

  return (
    <div className="relative h-44 w-44 flex items-center justify-center shrink-0">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
        {/* Background Track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="stroke-muted/30"
          strokeWidth="16"
          fill="transparent"
        />

        {/* Earnings Arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="stroke-emerald-500 transition-all duration-700 ease-out"
          strokeWidth="16"
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-[11px] font-bold text-foreground leading-tight max-w-[80px]">
          Salary Breakup
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
          {earningsPct}% Basic
        </span>
      </div>
    </div>
  );
}
