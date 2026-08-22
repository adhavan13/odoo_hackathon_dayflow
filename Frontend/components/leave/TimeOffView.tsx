'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Check,
  X,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { useAuthStore, useEmployeeStore } from '@/store';
import { useLeaveStore, LeaveRequest, PUBLIC_HOLIDAYS_2026 } from '@/store/useLeaveStore';
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

interface TimeOffViewProps {
  forcedRole?: 'admin' | 'employee';
}

export function TimeOffView({ forcedRole }: TimeOffViewProps) {
  const { user, role: storeRole } = useAuthStore();
  const { employees } = useEmployeeStore();
  const { leaves, applyLeave, updateLeaveStatus } = useLeaveStore();

  const currentRole = forcedRole || storeRole;
  const isAdmin = currentRole === 'admin';

  // Sub-bar tab: 'timeoff' | 'allocation'
  const [activeTab, setActiveTab] = useState<'timeoff' | 'allocation'>('timeoff');

  // View Mode: 'calendar' | 'table' (Defaults to calendar for employee, table for admin as per wireframe)
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>(isAdmin ? 'table' : 'calendar');

  // Search filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for NEW Time Off Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(user?.id || 'usr_emp_02');
  const [leaveType, setLeaveType] = useState<'Paid Time off' | 'Sick Leave' | 'Unpaid Leaves'>('Paid Time off');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Compute Days Count
  const getDaysCount = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculatedDays = getDaysCount(startDate, endDate);

  // Handle Certificate File Upload to Cloudinary
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'sick_certificates' });
      setAttachmentUrl(res.secure_url);
      snackbar.success('Sick leave certificate uploaded to Cloudinary');
    } catch (err: any) {
      const localUrl = URL.createObjectURL(file);
      setAttachmentUrl(localUrl);
      snackbar.info('Certificate attached (local preview)');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit New Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentEmp = employees.find((emp) => emp.id === selectedEmpId) || {
      id: user?.id || 'usr_emp_02',
      name: user?.name || 'Alex Rivera',
    };

    await applyLeave({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      leaveType,
      startDate,
      endDate,
      daysCount: calculatedDays,
      reason,
      attachmentUrl,
    });

    setIsModalOpen(false);
    // Reset fields
    setReason('');
    setAttachmentUrl('');
  };

  // Filter Leaves
  // Employees view ONLY their own time off records.
  // Admins & HR Officers view all employees' time off records.
  const userLeaves = isAdmin
    ? leaves
    : leaves.filter((l) => l.employeeId === (user?.id || 'usr_emp_02') || l.employeeName === user?.name || l.employeeName === 'Alex Rivera');

  const filteredLeaves = userLeaves.filter((l) => {
    const matchesSearch =
      l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      l.status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate Used & Remaining Balances
  const usedPaidDays = userLeaves
    .filter((l) => l.leaveType === 'Paid Time off' && l.status === 'Approved')
    .reduce((acc, curr) => acc + curr.daysCount, 0);

  const usedSickDays = userLeaves
    .filter((l) => l.leaveType === 'Sick Leave' && l.status === 'Approved')
    .reduce((acc, curr) => acc + curr.daysCount, 0);

  const availablePaidDays = Math.max(0, 24 - usedPaidDays);
  const availableSickDays = Math.max(0, 7 - usedSickDays);

  // Mini Calendar Generator for 12 Months (Jan 2026 - Dec 2026)
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

  // Check if a date string YYYY-MM-DD has leave or holiday
  const getDateMetadata = (dateStr: string) => {
    // Check Holiday
    const holiday = PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr);
    if (holiday) return { type: 'holiday', name: holiday.name };

    // Check Leaves
    const activeLeaves = userLeaves.filter((l) => {
      return dateStr >= l.startDate && dateStr <= l.endDate;
    });

    if (activeLeaves.length > 0) {
      const first = activeLeaves[0];
      return {
        type: 'leave',
        status: first.status,
        leaveType: first.leaveType,
        employeeName: first.employeeName,
      };
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Tabs Bar (Matching Odoo Wireframe: Time Off | Allocation) */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('timeoff')}
            className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'timeoff'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            Time Off
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allocation')}
            className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'allocation'
                ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            Allocation
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            {isAdmin ? 'Admin / HR Mode' : 'Employee Personal View'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30 flex items-center gap-1">
            {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {isAdmin ? 'Admin & HR Officers' : 'My Time Off'}
          </span>
        </div>
      </div>

      {/* Action Controls Bar: [NEW] Button, Searchbar, View Mode Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* NEW Button (Purple / Accent) */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs h-10 px-5 gap-2 rounded-xl cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            NEW
          </Button>

          {/* Searchbar */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Searchbar (employee, leave type, status...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-muted/20 rounded-xl"
            />
          </div>
        </div>

        {/* View Mode Switcher: Calendar vs Table */}
        <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'calendar' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-accent" />
            Calendar View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <ListFilter className="h-4 w-4 text-accent" />
            Table View
          </button>
        </div>
      </div>

      {/* Available Days Summary Cards (Matching Wireframe 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-between shadow-2xs">
          <div>
            <h3 className="text-sm font-extrabold text-blue-600 dark:text-blue-400">Paid time Off</h3>
            <p className="text-2xl font-black text-foreground mt-1">{String(availablePaidDays).padStart(2, '0')} Days Available</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Out of 24 allocated annual paid leave days</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-lg">
            🌴
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between shadow-2xs">
          <div>
            <h3 className="text-sm font-extrabold text-amber-600 dark:text-amber-400">Sick time off</h3>
            <p className="text-2xl font-black text-foreground mt-1">{String(availableSickDays).padStart(2, '0')} Days Available</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Out of 07 allocated annual sick leave days</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg">
            🩺
          </div>
        </div>
      </div>

      {/* Allocation Tab Banner */}
      {activeTab === 'allocation' && (
        <div className="p-6 rounded-2xl border border-accent/30 bg-accent/5 space-y-3">
          <div className="flex items-center gap-2 text-accent font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Leave Allocation Summary (Year 2026)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-card p-3 rounded-xl border border-border">
              <span className="text-muted-foreground">Paid Time Off Total:</span>
              <p className="font-bold text-foreground text-sm mt-0.5">24.00 Days</p>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border">
              <span className="text-muted-foreground">Sick Leave Total:</span>
              <p className="font-bold text-foreground text-sm mt-0.5">07.00 Days</p>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border">
              <span className="text-muted-foreground">Unpaid Leave Limit:</span>
              <p className="font-bold text-foreground text-sm mt-0.5">Unlimited (Subject to HR Approval)</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: TABLE VIEW (Wireframe 1 - For Admin / HR Officers & Table Mode) */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Time off Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                      No time off records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs shrink-0">
                            {item.employeeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{item.employeeName}</p>
                            {item.attachmentUrl && (
                              <a
                                href={item.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline mt-0.5"
                              >
                                <Paperclip className="h-3 w-3" />
                                Certificate Attached
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="p-4 font-mono font-semibold text-foreground">
                        {item.startDate.split('-').reverse().join('/')}
                      </td>

                      {/* End Date */}
                      <td className="p-4 font-mono font-semibold text-foreground">
                        {item.endDate.split('-').reverse().join('/')}
                      </td>

                      {/* Time Off Type */}
                      <td className="p-4">
                        <span className="font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                          {item.leaveType}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {item.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Approved
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                            <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                            <XCircle className="h-3.5 w-3.5 text-rose-500" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions: Reject [Red] & Approve [Green] buttons */}
                      <td className="p-4 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Reject Button (Red) */}
                            <button
                              type="button"
                              onClick={() => updateLeaveStatus(item.id, 'Rejected')}
                              disabled={item.status === 'Rejected'}
                              className="h-8 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                              title="Reject time off request"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>

                            {/* Approve Button (Green) */}
                            <button
                              type="button"
                              onClick={() => updateLeaveStatus(item.id, 'Approved')}
                              disabled={item.status === 'Approved'}
                              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                              title="Approve time off request"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {item.status === 'Pending' ? 'Awaiting Manager Review' : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL YEAR CALENDAR VIEW (Wireframe 2 - For Employee View & Full Year Display) */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 12 Months Mini-Calendar Grid (3 Columns x 4 Rows = 12 Months) */}
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

                  {/* Day Initials Header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                  </div>

                  {/* Day Cells Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
                    {/* Padding blank cells */}
                    {paddingArray.map((_, pIdx) => (
                      <div key={`p-${pIdx}`} className="h-6 w-6" />
                    ))}

                    {/* Active Month Days */}
                    {daysArray.map((dayNum) => {
                      const mm = String(mIdx + 1).padStart(2, '0');
                      const dd = String(dayNum).padStart(2, '0');
                      const dateStr = `2026-${mm}-${dd}`;
                      const meta = getDateMetadata(dateStr);

                      let bgClass = 'hover:bg-muted/60 text-foreground';
                      let badgeTitle = dateStr;

                      if (meta) {
                        if (meta.type === 'holiday') {
                          bgClass = 'bg-purple-500 text-white font-bold rounded-full shadow-xs';
                          badgeTitle = `Public Holiday: ${meta.name}`;
                        } else if (meta.type === 'leave') {
                          if (meta.status === 'Approved') {
                            bgClass = 'bg-emerald-500 text-white font-bold rounded-full shadow-xs';
                            badgeTitle = `Approved Leave: ${meta.leaveType} (${meta.employeeName})`;
                          } else if (meta.status === 'Pending') {
                            bgClass = 'bg-amber-500 text-white font-bold rounded-full shadow-xs';
                            badgeTitle = `To Approve (Pending): ${meta.leaveType} (${meta.employeeName})`;
                          } else if (meta.status === 'Rejected') {
                            bgClass = 'bg-rose-500 text-white font-bold rounded-full shadow-xs';
                            badgeTitle = `Refused (Rejected): ${meta.leaveType} (${meta.employeeName})`;
                          }
                        }
                      }

                      return (
                        <div
                          key={dayNum}
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

          {/* Right Legend & Public Holidays Panel (Matching Wireframe 2) */}
          <div className="space-y-6">
            {/* Color Legend */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Legend
              </h3>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="text-foreground">Validated / Approved</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shadow-xs" />
                  <span className="text-foreground">To Approve (Pending)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-rose-500 shadow-xs" />
                  <span className="text-foreground">Refused / Rejected</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-purple-500 shadow-xs" />
                  <span className="text-foreground">Public Holidays</span>
                </div>
              </div>
            </div>

            {/* Public Holidays List */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Public Holidays (2026)
              </h3>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                {PUBLIC_HOLIDAYS_2026.map((h) => (
                  <div
                    key={h.date}
                    className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-purple-700 dark:text-purple-300">{h.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {h.date.split('-').reverse().join('/')}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500 text-white font-bold">
                      Holiday
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TIME OFF TYPE REQUEST MODAL (Wireframe 3 - `NEW` Modal) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border bg-popover shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Time off Type Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your time off application with valid dates and certificate attachment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRequest} className="space-y-4 pt-2">
            {/* Employee Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Employee</Label>
              {isAdmin ? (
                <CustomSelect
                  value={selectedEmpId}
                  onValueChange={setSelectedEmpId}
                  options={employees.map((emp) => ({ label: emp.name, value: emp.id }))}
                />
              ) : (
                <Input
                  value={user?.name || 'Alex Rivera'}
                  disabled
                  className="text-xs bg-muted font-bold text-accent"
                />
              )}
            </div>

            {/* Time Off Type */}
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

            {/* Validity Period: Start Date To End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Start Date</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">End Date</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
            </div>

            {/* Allocation Days Calculation */}
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between text-xs">
              <span className="font-semibold text-accent">Allocation Duration:</span>
              <span className="font-mono font-black text-sm text-foreground">
                {String(calculatedDays).padStart(2, '0')}.00 Days
              </span>
            </div>

            {/* Attachment (For Sick Leave Certificate - Cloudinary powered) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Attachment <span className="text-muted-foreground font-normal">(For sick leave certificate)</span>
              </Label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="h-10 border border-dashed border-accent/50 hover:border-accent bg-muted/20 hover:bg-accent/5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-accent transition-colors px-3">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? 'Uploading to Cloudinary...' : attachmentUrl ? 'Change Certificate' : 'Upload Certificate'}</span>
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAttachmentUpload} />
                </label>
              </div>
              {attachmentUrl && (
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate">
                  ✓ Attached: {attachmentUrl}
                </p>
              )}
            </div>

            {/* Reason Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Reason / Notes</Label>
              <Input
                placeholder="Brief reason for time off request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Footer Buttons: Submit & Discard */}
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
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
