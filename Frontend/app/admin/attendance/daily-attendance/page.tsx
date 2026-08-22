"use client";

import React, { useEffect, useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Plane,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from "@/utils/api";

const formatTime = (value?: string | null) => {
  if (!value) return "--";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export default function AdminDailyAttendancePage() {
  // Navigation & Filter State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadAttendance = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/attendance/today", {
          params: {
            date: selectedDate,
            search: search || undefined,
            status: statusFilter,
            department: departmentFilter,
          },
        });
        const employeeResponse = await api.get("/employees");
        const employees = (employeeResponse.data as any) || [];
        const attendance = (response.data as any)?.attendance || [];
        setRecords(
          attendance.map((record: any) => {
            const employee = employees.find(
              (item: any) =>
                item.id === record.employeeId ||
                item.name === record.employeeName,
            );
            return {
              ...record,
              department: record.department || employee?.department,
              status:
                record.status === "PRESENT"
                  ? "Present"
                  : record.status === "LEAVE"
                    ? "On Leave"
                    : record.status === "HALF_DAY"
                      ? "Half Day"
                      : "Absent",
            };
          }),
        );
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadAttendance();
  }, [selectedDate, search, statusFilter, departmentFilter]);

  // Filter records by date, search, department, and status
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      (rec.department &&
        rec.department.toLowerCase().includes(search.toLowerCase()));
    const matchesDept =
      departmentFilter === "all" || rec.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      rec.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const presentCount = filteredRecords.filter(
    (r) => r.status === "Present" || r.status === "Late",
  ).length;
  const leaveCount = filteredRecords.filter(
    (r) => r.status === "On Leave" || r.status === "Absent",
  ).length;

  return (
    <PageContainer
      title="Attendance & Daily Work Logs"
      subtitle="Monitor workforce daily attendance, check-in/out times, worked shift hours, and employee daily work summaries"
      badge="Admin"
    >
      <div className="space-y-6">
        {/* Top Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Logged Records
              </p>
              <p className="text-xl font-extrabold text-foreground">
                {records.length}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Present Today
              </p>
              <p className="text-xl font-extrabold text-foreground">
                {presentCount}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold shrink-0">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                On Leave / Absent
              </p>
              <p className="text-xl font-extrabold text-foreground">
                {leaveCount}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-accent/40 bg-accent/10 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-bold shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-accent">
                Average Work Time
              </p>
              <p className="text-xl font-extrabold text-foreground">
                08:45 Hrs
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls (Matching Wireframe 1 input_file_0.png) */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Navigation: [<] [>] [Date v] [Day] */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 cursor-pointer text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 cursor-pointer text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Date Selector Dropdown */}
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                className="h-9 w-40 text-xs font-bold"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="h-9 text-xs font-bold px-3 hover:bg-accent/10 hover:text-accent"
              >
                Today
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employee name, department, or work note keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-muted/20"
              />
            </div>
          </div>

          {/* Department & Status Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Filter By:
              </span>
            </div>

            <CustomSelect
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
              options={[
                { label: "All Departments", value: "all" },
                { label: "Engineering", value: "Engineering" },
                { label: "Human Resources", value: "Human Resources" },
                { label: "Product", value: "Product" },
              ]}
              size="sm"
              className="w-48 text-xs h-8"
            />

            <CustomSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Present", value: "present" },
                { label: "On Leave", value: "on leave" },
                { label: "Absent", value: "absent" },
                { label: "Half Day", value: "half day" },
              ]}
              size="sm"
              className="w-36 text-xs h-8"
            />
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-foreground">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <span className="text-xs text-muted-foreground">
            Attendance Basis for Payroll Computation
          </span>
        </div>

        {/* Attendance & Work Logs List Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In / Out</th>
                  <th className="p-4">Worked Hours</th>
                  <th className="p-4">Daily Work Summary Note</th>
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
                      {/* Emp Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                            {rec.employeeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {rec.employeeName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {rec.department || "Department"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Check In */}
                      <td className="p-4 font-mono font-bold text-foreground">
                        {formatTime(rec.checkIn)}
                      </td>

                      {/* Check Out */}
                      <td className="p-4 font-mono font-bold text-foreground">
                        {rec.checkOut ? (
                          formatTime(rec.checkOut)
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                            Active (In Shift)
                          </span>
                        )}
                      </td>

                      {/* Work Hours */}
                      <td className="p-4 font-mono font-bold text-accent">
                        {rec.workHours || "08:30"}
                      </td>

                      {/* Extra Hours */}
                      <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {rec.extraHours || "00:00"}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-right">
                        {rec.status === "Present" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            {rec.checkOut ? "Present" : "Active Shift"}
                          </span>
                        )}
                        {rec.status === "Late" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Late
                          </span>
                        )}
                        {rec.status === "On Leave" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                            {rec.status}
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
                      No employee attendance records found for this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-card">
            <span className="text-xs text-muted-foreground font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin View Work Summary Note Full Dialog */}
      {selectedRecordForNote && (
        <Dialog open={!!selectedRecordForNote} onOpenChange={() => setSelectedRecordForNote(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <DialogHeader className="space-y-2 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold text-base">
                  {selectedRecordForNote.employeeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-foreground">
                    {selectedRecordForNote.employeeName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {selectedRecordForNote.department || 'Department'} • {selectedRecordForNote.date}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-2xl border border-border/80 text-center font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Check-In</span>
                  <span className="font-bold text-accent">{selectedRecordForNote.checkIn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Check-Out</span>
                  <span className="font-bold text-foreground">{selectedRecordForNote.checkOut || 'In Shift'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Work Hours</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedRecordForNote.workHours || '08:30'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-accent" />
                  Work Summary & Daily Deliverables Note
                </Label>
                <div className="bg-muted/30 p-4 rounded-2xl border border-border text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedRecordForNote.workSummaryNote}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={() => setSelectedRecordForNote(null)}
                className="bg-accent text-accent-foreground text-xs font-bold w-full cursor-pointer"
              >
                Close Work Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
}
