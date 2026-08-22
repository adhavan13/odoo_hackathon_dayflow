'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useLeaveStore } from '@/store/useLeaveStore';
import { useEmployeeStore } from '@/store';

// Daily HR Attendance & Shift Activity Data
const dailyActivityVolume = [
  { date: 'Jul 24', present: 45, onLeave: 4, halfDay: 2, late: 1, absent: 2 },
  { date: 'Jul 28', present: 48, onLeave: 3, halfDay: 1, late: 2, absent: 1 },
  { date: 'Aug 01', present: 44, onLeave: 5, halfDay: 3, late: 1, absent: 1 },
  { date: 'Aug 05', present: 47, onLeave: 4, halfDay: 1, late: 1, absent: 1 },
  { date: 'Aug 09', present: 49, onLeave: 3, halfDay: 1, late: 0, absent: 1 },
  { date: 'Aug 13', present: 46, onLeave: 4, halfDay: 2, late: 1, absent: 1 },
  { date: 'Aug 17', present: 48, onLeave: 3, halfDay: 1, late: 1, absent: 1 },
  { date: 'Aug 21', present: 50, onLeave: 2, halfDay: 1, late: 0, absent: 1 },
];

export function HRAnalyticsView() {
  const { leaves, fetchLeaves } = useLeaveStore();
  const { employees } = useEmployeeStore();
  const [timeWindow, setTimeWindow] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Compute live metrics
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;
  const totalRequests = leaves.length || 7;

  // Department Share Data
  const departmentShareData = [
    { name: 'Engineering', value: 22, percentage: '40.7%', runs: '22 employees', color: '#3b82f6' },
    { name: 'Sales', value: 12, percentage: '22.2%', runs: '12 employees', color: '#ea580c' },
    { name: 'Product', value: 10, percentage: '18.5%', runs: '10 employees', color: '#10b981' },
    { name: 'HR', value: 5, percentage: '9.3%', runs: '5 employees', color: '#e11d48' },
    { name: 'Marketing', value: 5, percentage: '9.3%', runs: '5 employees', color: '#8b5cf6' },
  ];

  // Outcome Share Data
  const outcomeShareData = [
    { name: 'Approved', value: approvedCount || 5, percentage: `${Math.round(((approvedCount || 5) / totalRequests) * 100)}%`, count: `${approvedCount || 5} requests`, color: '#10b981' },
    { name: 'Pending Review', value: pendingCount || 1, percentage: `${Math.round(((pendingCount || 1) / totalRequests) * 100)}%`, count: `${pendingCount || 1} request`, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedCount || 1, percentage: `${Math.round(((rejectedCount || 1) / totalRequests) * 100)}%`, count: `${rejectedCount || 1} request`, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Workforce</p>
            <p className="text-2xl font-black text-foreground font-mono mt-1">{employees.length || 54}</p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Present Today</p>
            <p className="text-2xl font-black text-foreground font-mono mt-1">48 <span className="text-xs font-medium text-muted-foreground">(88.8%)</span></p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> On-time rate 94%
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* On Approved Leave */}
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">On Approved Leave</p>
            <p className="text-2xl font-black text-foreground font-mono mt-1">{approvedCount || 4}</p>
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {pendingCount || 3} pending review
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Avg Working Hours */}
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Avg Shift Hours</p>
            <p className="text-2xl font-black text-foreground font-mono mt-1">8.4 <span className="text-xs font-medium text-muted-foreground">hrs/day</span></p>
            <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> 168.5 total monthly hrs
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW - PIE & DONUT CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD: Departmental Workforce Share */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-border pb-3 w-full text-left">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Departmental Workforce Share
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution of employees across company departments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 py-2 w-full">
            {/* Left Side: Donut Chart with Center Metric */}
            <div className="sm:col-span-5 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={departmentShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover, #1e293b)',
                      borderColor: 'var(--border, #334155)',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-foreground font-mono">{employees.length || 54}</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Employees</span>
              </div>
            </div>

            {/* Right Side: Data Legend List */}
            <div className="sm:col-span-7 space-y-2.5 text-xs">
              {departmentShareData.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between font-medium gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-xs shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="font-bold text-foreground truncate">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-extrabold text-foreground">{dept.percentage}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">({dept.runs})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Leave Request Statuses Donut Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-border pb-3 w-full text-left">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-accent" />
              Leave Request Statuses
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution of approved, pending, and refused requests</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 py-2 w-full">
            {/* Left Side: Donut Chart with Center Metric */}
            <div className="sm:col-span-5 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={outcomeShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomeShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover, #1e293b)',
                      borderColor: 'var(--border, #334155)',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-foreground font-mono">{totalRequests}</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Requests</span>
              </div>
            </div>

            {/* Right Side: Data Legend List */}
            <div className="sm:col-span-7 space-y-2.5 text-xs">
              {outcomeShareData.map((out) => (
                <div key={out.name} className="flex items-center justify-between font-medium gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-xs shrink-0" style={{ backgroundColor: out.color }} />
                    <span className="font-bold text-foreground truncate">{out.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-extrabold text-foreground">{out.percentage}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">({out.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW - FULL-WIDTH ATTENDANCE VOLUME BAR / LINE CHART */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Workforce Shift & Attendance Volume
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Daily check-ins, leave allocations, and attendance breakdown — Last 30 Days
            </p>
          </div>

          {/* Daily | Weekly | Monthly Pills */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
            {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeWindow(mode)}
                className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                  timeWindow === mode
                    ? 'bg-card text-accent shadow-xs border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Stacked Bar Chart with Rounded Top Bar Caps */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyActivityVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" opacity={0.4} />
              <XAxis dataKey="date" stroke="currentColor" className="text-[11px] text-muted-foreground" />
              <YAxis stroke="currentColor" className="text-[11px] text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover, #1e293b)',
                  borderColor: 'var(--border, #334155)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="present" name="Present / Checked In" stackId="a" fill="#10b981" />
              <Bar dataKey="onLeave" name="On Leave" stackId="a" fill="#3b82f6" />
              <Bar dataKey="halfDay" name="Half Day / Break" stackId="a" fill="#f59e0b" />
              <Bar dataKey="late" name="Late Arrival" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Chart Legend Pills */}
        <div className="flex flex-wrap items-center justify-start gap-4 pt-2 border-t border-border/60 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#10b981]" />
            <span className="text-foreground">Present / Checked In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#3b82f6]" />
            <span className="text-foreground">On Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#f59e0b]" />
            <span className="text-foreground">Half Day / Break</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#8b5cf6]" />
            <span className="text-foreground">Late Arrival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#ef4444]" />
            <span className="text-foreground">Absent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
