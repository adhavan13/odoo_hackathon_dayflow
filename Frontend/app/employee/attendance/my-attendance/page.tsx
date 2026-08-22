'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useAttendanceStore } from '@/store';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';

export default function EmployeeMyAttendancePage() {
  const { records } = useAttendanceStore();

  // Date Navigation State
  const [selectedMonth, setSelectedMonth] = useState<'Oct' | 'Nov' | 'Dec'>('Oct');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter employee's own records (Alex Rivera / current logged in employee)
  const myRecords = records.filter(
    (rec) => rec.employeeName === 'Alex Rivera' || rec.employeeId === 'usr_emp_02'
  );

  // Summary statistics calculation (Matching Wireframe 2)
  const totalWorkingDays = 24;
  const countOfDaysPresent = myRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length || 22;
  const leavesCount = myRecords.filter((r) => r.status === 'On Leave' || r.status === 'Absent').length || 2;
  const payableDays = totalWorkingDays - (totalWorkingDays - countOfDaysPresent);

  // Filtered dataset
  const filteredRecords = myRecords.filter((rec) => {
    const matchesSearch = rec.date.includes(search) || rec.status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rec.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
                onClick={() => setSelectedMonth(selectedMonth === 'Nov' ? 'Oct' : 'Nov')}
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 cursor-pointer text-foreground"
                onClick={() => setSelectedMonth(selectedMonth === 'Oct' ? 'Nov' : 'Dec')}
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-input bg-muted/30 text-xs font-bold text-foreground">
              <CalendarIcon className="h-3.5 w-3.5 text-accent" />
              <span>{selectedMonth} 2025</span>
            </div>
          </div>

          {/* Stat 1: Count of days present */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Count of Days Present</p>
              <p className="text-base font-extrabold text-foreground">{countOfDaysPresent} Days</p>
            </div>
          </div>

          {/* Stat 2: Leaves count */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 font-bold">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Leaves Count</p>
              <p className="text-base font-extrabold text-foreground">{leavesCount} Days</p>
            </div>
          </div>

          {/* Stat 3: Total working days */}
          <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 font-bold">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total Working Days</p>
              <p className="text-base font-extrabold text-foreground">{totalWorkingDays} Days</p>
            </div>
          </div>

          {/* Stat 4: Payable Days Impact */}
          <div className="p-3 rounded-xl border border-accent/40 bg-accent/10 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0 font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-accent">Payable Days (Payroll)</p>
              <p className="text-base font-extrabold text-foreground">{payableDays} Days</p>
            </div>
          </div>
        </div>

        {/* Note on Attendance Basis for Payslip */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Attendance Basis Note:</strong> Attendance data serves as the foundation for payslip generation. Total payable days are calculated directly from attendance records. Any unpaid leave or missing attendance days automatically reduce the number of payable days during payslip computation.
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
                { label: 'All Statuses', value: 'all' },
                { label: 'Present', value: 'present' },
                { label: 'Late', value: 'late' },
                { label: 'On Leave', value: 'on leave' },
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
            <h3 className="font-bold text-sm text-foreground">22, October 2025 Attendance Log</h3>
            <span className="text-xs text-muted-foreground">Daily Working Time & Overtime Breakdown</span>
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
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground">{rec.date}</td>
                      <td className="p-4 text-foreground font-semibold">{rec.checkIn}</td>
                      <td className="p-4 text-foreground font-semibold">{rec.checkOut || '19:00'}</td>
                      <td className="p-4 font-mono text-accent font-bold">{rec.workHours || '09:00'}</td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {rec.extraHours || '01:00'}
                      </td>
                      <td className="p-4 text-right">
                        {rec.status === 'Present' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Present
                          </span>
                        )}
                        {rec.status === 'Late' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Late
                          </span>
                        )}
                        {rec.status === 'On Leave' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                            On Leave
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
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
