'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Palmtree,
  Stethoscope,
  BarChart3,
  Plus,
  Bell,
  Upload,
  Paperclip,
  Check,
  UserCheck,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEmployeeStore } from '@/store';
import { useLeaveStore, PUBLIC_HOLIDAYS_2026, PublicHoliday, LeaveRequest } from '@/store/useLeaveStore';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { snackbar } from '@/utils/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AdminLeaveScheduleView() {
  const { employees } = useEmployeeStore();
  const { leaves, holidays, fetchLeaves, fetchHolidays, applyLeave, addHoliday } = useLeaveStore();

  useEffect(() => {
    fetchLeaves();
    fetchHolidays();
  }, [fetchLeaves, fetchHolidays]);

  // Table Pagination State
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 5;

  // Date Modal State
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-25');
  const [activeTab, setActiveTab] = useState<'info' | 'holiday' | 'leave'>('info');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  
  // Admin Leave Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'usr_emp_02');
  const [leaveType, setLeaveType] = useState<'Paid Time off' | 'Sick Leave' | 'Unpaid Leaves'>('Paid Time off');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const getDaysCount = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculatedDays = getDaysCount(startDate, endDate);

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'sick_certificates' });
      setAttachmentUrl(res.secure_url);
      snackbar.success('Document uploaded to Cloudinary');
    } catch (err: any) {
      const localUrl = URL.createObjectURL(file);
      setAttachmentUrl(localUrl);
      snackbar.info('Document attached');
    } finally {
      setIsUploading(false);
    }
  };

  // Create Company Holiday Announcement
  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;

    await addHoliday(selectedDateStr, announcementTitle.trim());
    setIsModalOpen(false);
    setAnnouncementTitle('');
  };

  // Allocate Employee Leave
  const handleAdminApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId) || { id: selectedEmpId, name: 'Employee' };

    await applyLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate,
      daysCount: calculatedDays,
      reason,
      attachmentUrl,
    });

    setIsModalOpen(false);
    setReason('');
    setAttachmentUrl('');
  };

  const allHolidays = holidays && holidays.length > 0 ? holidays : PUBLIC_HOLIDAYS_2026;

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (monthIndex: number, year = 2026) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (monthIndex: number, year = 2026) => {
    return new Date(year, monthIndex, 1).getDay();
  };

  const getDateMetadata = (dateStr: string) => {
    const holiday = allHolidays.find((h) => h.date === dateStr);
    const activeLeaves = leaves.filter((l) => dateStr >= l.startDate && dateStr <= l.endDate);

    return {
      holiday: holiday ? holiday.name : null,
      activeLeaves,
      count: activeLeaves.length,
      hasHoliday: !!holiday,
      hasLeaves: activeLeaves.length > 0,
    };
  };

  // Date Click
  const handleDateClick = (dateStr: string, defaultTab: 'info' | 'holiday' | 'leave' = 'info') => {
    setSelectedDateStr(dateStr);
    setStartDate(dateStr);
    setEndDate(dateStr);
    const meta = getDateMetadata(dateStr);

    if (!meta.hasHoliday && !meta.hasLeaves && defaultTab === 'info') {
      setActiveTab('holiday');
    } else {
      setActiveTab(defaultTab);
    }
    setIsModalOpen(true);
  };

  const activeDateMeta = getDateMetadata(selectedDateStr);
  const totalEmployeesCount = employees.length || 54;
  const leavesOnSelectedDate = activeDateMeta.activeLeaves;
  const activeWorkingCount = Math.max(0, totalEmployeesCount - leavesOnSelectedDate.length);

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="p-5 rounded-2xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Interactive Workforce Schedule & Company Holiday Admin</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any calendar date to view employee coverage or create custom company holidays & leave announcements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => handleDateClick('2026-08-25', 'holiday')}
            className="bg-accent/15 text-accent hover:bg-accent/25 font-bold text-xs h-10 px-4 gap-2 rounded-xl cursor-pointer border border-accent/30"
          >
            <Sparkles className="h-4 w-4" />
            + Add Holiday
          </Button>
          <Button
            onClick={() => handleDateClick('2026-08-25', 'leave')}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs h-10 px-4 gap-2 rounded-xl cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            + Allocate Leave
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 12 Months Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {months.map((monthName, mIdx) => {
            const totalDays = getDaysInMonth(mIdx, 2026);
            const firstDayIndex = getFirstDayOfMonth(mIdx, 2026);
            const paddingArray = Array.from({ length: firstDayIndex });
            const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

            return (
              <div
                key={monthName}
                className="rounded-2xl border border-border bg-card p-3 shadow-2xs hover:border-accent/40 transition-all"
              >
                <h4 className="font-bold text-xs text-foreground text-center mb-2 pb-1 border-b border-border/60">
                  {monthName} 2026
                </h4>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
                  {paddingArray.map((_, pIdx) => (
                    <div key={`p-${pIdx}`} className="h-6 w-6" />
                  ))}

                  {daysArray.map((dayNum) => {
                    const mm = String(mIdx + 1).padStart(2, '0');
                    const dd = String(dayNum).padStart(2, '0');
                    const dateStr = `2026-${mm}-${dd}`;
                    const meta = getDateMetadata(dateStr);

                    let bgClass = 'hover:bg-accent/10 hover:text-accent text-foreground';
                    let badgeTitle = `Click date ${dateStr} to manage holiday or leave`;

                    if (meta.hasHoliday) {
                      bgClass = 'bg-accent/20 text-accent font-bold rounded-lg border border-accent/30 shadow-xs';
                      badgeTitle = `Company Holiday: ${meta.holiday}`;
                    } else if (meta.hasLeaves) {
                      const first = meta.activeLeaves[0];
                      if (first.status === 'Approved') {
                        bgClass = 'bg-emerald-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Approved: ${first.employeeName} (${first.leaveType})`;
                      } else if (first.status === 'Pending') {
                        bgClass = 'bg-amber-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Pending: ${first.employeeName} (${first.leaveType})`;
                      } else if (first.status === 'Rejected') {
                        bgClass = 'bg-rose-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Refused: ${first.employeeName} (${first.leaveType})`;
                      }
                    }

                    return (
                      <div
                        key={dayNum}
                        onClick={() => handleDateClick(dateStr)}
                        title={badgeTitle}
                        className={`h-6.5 w-6.5 flex items-center justify-center rounded-lg transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Legend & Public Holidays Panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Workforce Legend
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-emerald-500 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">Approved Leave</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-amber-500 flex items-center justify-center shadow-xs">
                  <Clock className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">Pending Action</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-rose-500 flex items-center justify-center shadow-xs">
                  <XCircle className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">Refused Application</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center shadow-xs">
                  <Sparkles className="h-3 w-3 text-accent" />
                </span>
                <span className="text-foreground">Company Holidays</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
              <span>Holidays & Announcements ({allHolidays.length})</span>
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
              {allHolidays.map((h) => (
                <div
                  key={h.date + h.name}
                  onClick={() => handleDateClick(h.date)}
                  className="p-2.5 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between hover:border-accent/40 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-foreground">{h.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {h.date.split('-').reverse().join('/')}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/15 text-accent font-bold border border-accent/30 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Holiday
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Annual Workforce Leave Allocation Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs mt-6">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            Annual Employee Leave Allocations & Usage Summary
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {employees.length} employees tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Paid Leave (Used / 24)</th>
                <th className="p-4">Sick Leave (Used / 7)</th>
                <th className="p-4">Unpaid Leave Taken</th>
                <th className="p-4 text-right">Total Absence Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {employees.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize).map((emp) => {
                const empLeaves = leaves.filter((l) => (l.employeeId === emp.id || l.employeeName === emp.name) && l.status === 'Approved');
                const paidUsed = empLeaves.filter((l) => l.leaveType === 'Paid Time off').reduce((a, b) => a + b.daysCount, 0);
                const sickUsed = empLeaves.filter((l) => l.leaveType === 'Sick Leave').reduce((a, b) => a + b.daysCount, 0);
                const unpaidUsed = empLeaves.filter((l) => l.leaveType === 'Unpaid Leaves').reduce((a, b) => a + b.daysCount, 0);
                const totalUsed = paidUsed + sickUsed + unpaidUsed;

                return (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-foreground">
                      {emp.department || 'Engineering'}
                    </td>

                    <td className="p-4 font-mono font-bold text-accent">
                      {paidUsed} / 24 Days
                    </td>

                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {sickUsed} / 7 Days
                    </td>

                    <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {unpaidUsed} Days
                    </td>

                    <td className="p-4 text-right font-mono font-black text-foreground">
                      {totalUsed} Days Taken
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{employees.length === 0 ? 0 : (tablePage - 1) * tablePageSize + 1}</span> to{' '}
            <span className="font-bold text-foreground">{Math.min(tablePage * tablePageSize, employees.length)}</span> of{' '}
            <span className="font-bold text-foreground">{employees.length}</span> employees
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              disabled={tablePage === 1}
              className="h-8 px-3 text-xs font-bold gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-1 font-mono font-bold text-xs px-2">
              Page {tablePage} of {Math.ceil(employees.length / tablePageSize) || 1}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTablePage((p) => Math.min(Math.ceil(employees.length / tablePageSize) || 1, p + 1))}
              disabled={tablePage === (Math.ceil(employees.length / tablePageSize) || 1)}
              className="h-8 px-3 text-xs font-bold gap-1 cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* UNIFIED ADMIN DATE MANAGER POPUP MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg w-full max-w-[95vw] rounded-2xl border border-border bg-popover shadow-2xl p-6 space-y-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Calendar Date: {selectedDateStr.split('-').reverse().join('/')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Workforce absence coverage, employee leave records, and company holiday announcements for this date.
            </DialogDescription>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Date Stats & Leaves ({leavesOnSelectedDate.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('holiday')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === 'holiday'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              + Add Holiday
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leave')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === 'leave'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              + Allocate Leave
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-4 pt-1">
              {/* Full Day Stats Cards Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-lg font-extrabold text-foreground">{leavesOnSelectedDate.length}</p>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Out of Office</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{activeWorkingCount}</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Working</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                    {Math.round((leavesOnSelectedDate.length / totalEmployeesCount) * 100)}%
                  </p>
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Absence Rate</p>
                </div>
              </div>

              {/* Official Holiday Notice Card (if any) */}
              {activeDateMeta.hasHoliday && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-accent font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>Company Holiday / Announcement</span>
                  </div>
                  <p className="text-sm font-extrabold text-foreground">{activeDateMeta.holiday}</p>
                  <p className="text-[11px] text-muted-foreground">Official non-working company holiday on this date.</p>
                </div>
              )}

              {/* List of Employees On Leave on Selected Date */}
              {leavesOnSelectedDate.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Employees On Leave on {selectedDateStr.split('-').reverse().join('/')}:
                  </p>
                  {leavesOnSelectedDate.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-muted/30 border border-border space-y-2 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center border border-accent/40">
                            {item.employeeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-foreground">{item.employeeName}</p>
                            <p className="text-[10px] text-muted-foreground">{item.reason || 'Time off request'}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {item.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Approved
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                            <XCircle className="h-3 w-3 text-rose-500" />
                            Refused
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                        <span className="font-semibold text-accent">{item.leaveType}</span>
                        <span className="font-mono text-muted-foreground">{item.daysCount} Days ({item.startDate} to {item.endDate})</span>
                      </div>

                      {item.attachmentUrl && (
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20"
                        >
                          <Paperclip className="h-3 w-3" />
                          View Medical Certificate Attachment
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/20 border border-border text-center space-y-2">
                  <p className="text-xs font-semibold text-foreground">Regular Working Day Coverage</p>
                  <p className="text-[11px] text-muted-foreground">No employees are on leave on this date.</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Button
                      type="button"
                      onClick={() => setActiveTab('holiday')}
                      className="bg-accent/15 text-accent hover:bg-accent/25 font-bold text-xs h-8 px-3 gap-1 rounded-xl border border-accent/30 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Add Holiday
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab('leave')}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs h-8 px-3 gap-1 rounded-xl cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Allocate Leave
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'holiday' && (
            <form onSubmit={handleCreateHoliday} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Holiday / Announcement Title</Label>
                <Input
                  placeholder="e.g. Annual Team Offsite, Foundation Day..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2 text-xs text-accent font-semibold">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Will highlight on calendar for all employees.</span>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold cursor-pointer"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs px-6 cursor-pointer"
                >
                  Create Announcement
                </Button>
              </DialogFooter>
            </form>
          )}

          {activeTab === 'leave' && (
            <form onSubmit={handleAdminApplyLeave} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Select Employee</Label>
                <CustomSelect
                  value={selectedEmpId}
                  onValueChange={setSelectedEmpId}
                  options={employees.map((e) => ({ label: e.name, value: e.id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Time off Type</Label>
                <CustomSelect
                  value={leaveType}
                  onValueChange={(val: any) => setLeaveType(val)}
                  options={[
                    { label: 'Paid Time off', value: 'Paid Time off' },
                    { label: 'Sick Leave', value: 'Sick Leave' },
                    { label: 'Unpaid Leaves', value: 'Unpaid Leaves' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold text-foreground">Start Date</Label>
                  <DatePicker value={startDate} onChange={setStartDate} />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold text-foreground">End Date</Label>
                  <DatePicker value={endDate} onChange={setEndDate} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 flex flex-row items-center justify-between gap-2 text-xs min-w-0">
                <span className="font-semibold text-accent shrink-0">Allocation Duration:</span>
                <span className="font-mono font-black text-sm text-foreground shrink-0">
                  {String(calculatedDays).padStart(2, '0')}.00 Days
                </span>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold text-foreground">
                  Attachment <span className="text-muted-foreground font-normal">(Optional medical certificate)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="h-10 border border-dashed border-accent/50 hover:border-accent bg-muted/20 hover:bg-accent/5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-accent transition-colors px-3">
                      <Upload className="h-4 w-4" />
                      <span>{isUploading ? 'Uploading to Cloudinary...' : attachmentUrl ? 'Change File' : 'Upload Document'}</span>
                    </div>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAttachmentUpload} />
                  </label>
                </div>
                {attachmentUrl && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 min-w-0 overflow-hidden">
                    <span className="shrink-0">✓ Uploaded:</span>
                    <span className="truncate flex-1">{attachmentUrl}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Reason / Notes</Label>
                <Input
                  placeholder="Manager note for leave approval..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold cursor-pointer"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs px-6 cursor-pointer"
                >
                  Save Allocation
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
