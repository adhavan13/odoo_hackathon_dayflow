"use client";

import React, { useEffect, useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { useAttendanceStore } from "@/store";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Plane,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Coffee, LogIn, LogOut } from "lucide-react";

export default function EmployeeMyAttendancePage() {
  const {
    records,
    summary,
    isCheckedIn,
    checkInTime,
    isLoading,
    fetchAttendance,
    fetchToday,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
  } = useAttendanceStore();

  // Date Navigation State
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    void fetchAttendance(selectedMonth);
    void fetchToday();
  }, [fetchAttendance, fetchToday, selectedMonth]);

  const myRecords = records;
  const totalWorkingDays = summary?.totalWorkingDays || 0;
  const countOfDaysPresent = summary?.daysPresent || 0;
  const leavesCount = summary?.daysOnLeave || 0;
  const payableDays = Math.max(
    0,
    totalWorkingDays - (summary?.daysAbsent || 0),
  );
  const weekendDays = (() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, index) =>
      new Date(year, month - 1, index + 1).getDay(),
    ).filter((day) => day === 0 || day === 6).length;
  })();
  const monthLabel = new Date(
    `${selectedMonth}-01T00:00:00`,
  ).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const changeMonth = (amount: number) => {
    const date = new Date(`${selectedMonth}-01T00:00:00`);
    date.setMonth(date.getMonth() + amount);
    setSelectedMonth(date.toISOString().slice(0, 7));
    setSelectedDate(date.toISOString().slice(0, 10));
    setCurrentPage(1);
  };

  // Filtered dataset
  const filteredRecords = myRecords.filter((rec) => {
    const matchesSearch =
      rec.date.includes(search) ||
      rec.status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      rec.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <PageContainer
      title="Attendance"
      subtitle="View your day-wise working time, check-in/out logs, breaks, and payroll payable days impact"
      badge="Employee"
    >
      <div className="space-y-6">
        {/* Top Control Bar with Summary Stats Cards (Matching Wireframe 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Navigation Controls Box: [<] [>] [Oct v] */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 cursor-pointer text-foreground"
                onClick={() => changeMonth(-1)}
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 cursor-pointer text-foreground"
                onClick={() => changeMonth(1)}
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-input bg-muted/30 text-xs font-bold text-foreground">
              <CalendarIcon className="h-3.5 w-3.5 text-accent" />
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedMonth(date.slice(0, 7));
                  setCurrentPage(1);
                }}
                formatString="MMM yyyy"
                className="h-8 border-0 bg-transparent px-1 shadow-none"
              />
            </div>
          </div>

          {/* Stat 1: Count of days present */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Count of Days Present
              </p>
              <p className="text-base font-extrabold text-foreground">
                {countOfDaysPresent} Days
              </p>
            </div>
          </div>

          {/* Stat 2: Leaves count */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 font-bold">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Leaves Count
              </p>
              <p className="text-base font-extrabold text-foreground">
                {leavesCount} Days
              </p>
            </div>
          </div>

          {/* Stat 3: Total working days */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 font-bold">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Total Working Days
              </p>
              <p className="text-base font-extrabold text-foreground">
                {totalWorkingDays} Days
              </p>
            </div>
          </div>

          {/* Stat 4: Payable Days Impact */}
          <div className="p-3 rounded-xl border border-accent/40 bg-accent/10 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0 font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-accent">
                Payable Days (Payroll)
              </p>
              <p className="text-base font-extrabold text-foreground">
                {payableDays} Days
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/15 text-violet-600 flex items-center justify-center shrink-0 font-bold">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Paid Leave
              </p>
              <p className="text-base font-extrabold text-foreground">
                {leavesCount} Days
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 font-bold">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Weekend
              </p>
              <p className="text-base font-extrabold text-foreground">
                {weekendDays} Days
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">
                Today&apos;s attendance
              </p>
              <p className="text-xs text-muted-foreground">
                {checkInTime
                  ? `Checked in at ${checkInTime}`
                  : "No active attendance session"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void checkIn()}
                disabled={isCheckedIn || isLoading}
                className="h-9 cursor-pointer gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                <LogIn className="h-3.5 w-3.5" /> Check In
              </Button>
              <Button
                type="button"
                onClick={() => void checkOut()}
                disabled={!isCheckedIn || isLoading}
                variant="outline"
                className="h-9 cursor-pointer gap-1.5 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" /> Check Out
              </Button>
              <Button
                type="button"
                onClick={() => void startBreak()}
                disabled={!isCheckedIn || isLoading}
                variant="outline"
                className="h-9 cursor-pointer gap-1.5 text-xs"
              >
                <Coffee className="h-3.5 w-3.5" /> Start Break
              </Button>
              <Button
                type="button"
                onClick={() => void endBreak()}
                disabled={!isCheckedIn || isLoading}
                variant="outline"
                className="h-9 cursor-pointer gap-1.5 text-xs"
              >
                <Coffee className="h-3.5 w-3.5" /> End Break
              </Button>
            </div>
          </div>
        </div>

        {/* Note on Attendance Basis for Payslip */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Attendance Basis Note:</strong>{" "}
            Attendance data serves as the foundation for payslip generation.
            Total payable days are calculated directly from attendance records.
            Any unpaid leave or missing attendance days automatically reduce the
            number of payable days during payslip computation.
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search date (e.g. 2025-10-28)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CustomSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Present", value: "present" },
                { label: "Late", value: "late" },
                { label: "On Leave", value: "on leave" },
              ]}
              size="sm"
              className="w-36 text-xs h-9"
            />
          </div>
        </div>

        {/* Day-Wise Attendance List Table (Matching Wireframe 2) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          {/* Table Subtitle Header */}
          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              {monthLabel} Attendance Log
            </h3>
            <span className="text-xs text-muted-foreground">
              Daily Working Time & Overtime Breakdown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Work Hours</th>
                  <th className="p-4">Extra Hours</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground text-xs"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : paginatedRecords.length > 0 ? (
                  paginatedRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-foreground">
                        {rec.date}
                      </td>
                      <td className="p-4 text-foreground font-semibold">
                        {rec.checkIn}
                      </td>
                      <td className="p-4 text-foreground font-semibold">
                        {rec.checkOut || "--"}
                      </td>
                      <td className="p-4 font-mono text-accent font-bold">
                        {rec.workHours || "00:00"}
                      </td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {rec.extraHours || "00:00"}
                      </td>
                      <td className="p-4 text-right">
                        {rec.status === "Present" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Present
                          </span>
                        )}
                        {rec.status === "Late" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Late
                          </span>
                        )}
                        {rec.status === "On Leave" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                            On Leave
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground text-xs"
                    >
                      No attendance logs found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
