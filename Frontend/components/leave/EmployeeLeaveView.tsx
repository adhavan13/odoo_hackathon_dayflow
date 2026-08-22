'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Palmtree,
  Stethoscope,
  CalendarX,
  Upload,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { useLeaveStore, LeaveRequest, LeaveBalance } from '@/store/useLeaveStore';
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

export function EmployeeLeaveView() {
  const { user } = useAuthStore();
  const { leaves, balances, paidLeaveLimit, sickLeaveLimit, fetchLeaves, fetchBalances, applyLeave } = useLeaveStore();

  useEffect(() => {
    fetchLeaves();
    fetchBalances();
  }, [fetchLeaves, fetchBalances]);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // New Leave Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      snackbar.success('Sick leave certificate uploaded to Cloudinary');
    } catch (err: any) {
      const localUrl = URL.createObjectURL(file);
      setAttachmentUrl(localUrl);
      snackbar.info('Certificate attached (local preview)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    await applyLeave({
      employeeId: user?.id || user?.employeeId || 'usr_emp_02',
      employeeName: user?.name || 'Alex Rivera',
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

  // Filter Employee Personal Leaves
  const myLeaves = leaves.filter(
    (l) =>
      l.employeeId === (user?.id || 'usr_emp_02') ||
      l.employeeId === user?.employeeId ||
      l.employeeName === user?.name ||
      l.employeeName === 'Alex Rivera'
  );

  const filteredLeaves = myLeaves.filter((item) => {
    const matchesSearch =
      item.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(search.toLowerCase())) ||
      item.status.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === 'all' || item.leaveType.toLowerCase() === typeFilter.toLowerCase();

    const matchesStartDate = !startDateFilter || item.startDate >= startDateFilter;
    const matchesEndDate = !endDateFilter || item.endDate <= endDateFilter;

    return matchesSearch && matchesStatus && matchesType && matchesStartDate && matchesEndDate;
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, startDateFilter, endDateFilter]);

  const totalPages = Math.ceil(filteredLeaves.length / pageSize) || 1;
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Compute Balances using Organization Policy Limits
  const allocatedPaidDays = paidLeaveLimit || 24;
  const allocatedSickDays = sickLeaveLimit || 7;

  const paidBal = balances?.find((b: LeaveBalance) => b.leaveType === 'Paid Time off') || { allocatedDays: allocatedPaidDays, usedDays: 4 };
  const sickBal = balances?.find((b: LeaveBalance) => b.leaveType === 'Sick Leave') || { allocatedDays: allocatedSickDays, usedDays: 2 };
  const unpaidBal = balances?.find((b: LeaveBalance) => b.leaveType === 'Unpaid Leaves') || { allocatedDays: 0, usedDays: 0 };

  const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved');
  const usedPaidDays = approvedLeaves.filter((l) => l.leaveType === 'Paid Time off').reduce((a, b) => a + b.daysCount, 0) || paidBal.usedDays;
  const usedSickDays = approvedLeaves.filter((l) => l.leaveType === 'Sick Leave').reduce((a, b) => a + b.daysCount, 0) || sickBal.usedDays;
  const usedUnpaidDays = approvedLeaves.filter((l) => l.leaveType === 'Unpaid Leaves').reduce((a, b) => a + b.daysCount, 0) || unpaidBal.usedDays;

  const remPaid = Math.max(0, allocatedPaidDays - usedPaidDays);
  const remSick = Math.max(0, allocatedSickDays - usedSickDays);
  const pendingCount = myLeaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Time Off */}
        <div className="p-4 rounded-xl border border-accent/30 bg-card flex items-center justify-between shadow-2xs hover:border-accent/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">Paid Time off Balance</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{String(remPaid).padStart(2, '0')} / {allocatedPaidDays} Days</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{usedPaidDays} Days used • Policy Limit: {allocatedPaidDays}/yr</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <Palmtree className="h-4 w-4" />
          </div>
        </div>

        {/* Sick Leave */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-card flex items-center justify-between shadow-2xs hover:border-amber-500/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sick Leave Balance</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{String(remSick).padStart(2, '0')} / {allocatedSickDays} Days</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{usedSickDays} Days used • Policy Limit: {allocatedSickDays}/yr</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Stethoscope className="h-4 w-4" />
          </div>
        </div>

        {/* Unpaid Leaves */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-card flex items-center justify-between shadow-2xs hover:border-purple-500/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Unpaid Leave</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{String(usedUnpaidDays).padStart(2, '0')} Days</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Subject to manager approval</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
            <CalendarX className="h-4 w-4" />
          </div>
        </div>

        {/* Pending Applications */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-card flex items-center justify-between shadow-2xs hover:border-emerald-500/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{pendingCount} Requests</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting manager decision</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: NEW Button, Search, Filters, and Date Range Selection */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs h-10 px-5 gap-2 rounded-xl cursor-pointer shadow-md shrink-0"
          >
            <Plus className="h-4 w-4" />
            Apply for Time Off
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reason or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-muted/20 rounded-xl"
              />
            </div>

            {/* Status Select */}
            <div className="w-32">
              <CustomSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                ]}
              />
            </div>

            {/* Type Select */}
            <div className="w-36">
              <CustomSelect
                value={typeFilter}
                onValueChange={setTypeFilter}
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Paid Time off', value: 'Paid Time off' },
                  { label: 'Sick Leave', value: 'Sick Leave' },
                  { label: 'Unpaid Leaves', value: 'Unpaid Leaves' },
                ]}
              />
            </div>

            {/* Date Range Selection */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-32">
                <DatePicker value={startDateFilter} onChange={setStartDateFilter} placeholder="From Date" />
              </div>
              <span className="text-xs text-muted-foreground font-bold">-</span>
              <div className="w-32">
                <DatePicker value={endDateFilter} onChange={setEndDateFilter} placeholder="To Date" />
              </div>
              {(startDateFilter || endDateFilter || search || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                  className="h-9 px-2 text-[11px] font-bold text-accent hover:bg-accent/10"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Leave Requests Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            My Time Off Application Records
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            Filtered: {filteredLeaves.length} applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Time Off Type</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason / Notes</th>
                <th className="p-4">Attachment</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-medium">
                    No time off applications found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Time Off Type */}
                    <td className="p-4">
                      {item.leaveType === 'Paid Time off' && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                          <Palmtree className="h-3.5 w-3.5" />
                          Paid Time off
                        </span>
                      )}
                      {item.leaveType === 'Sick Leave' && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Stethoscope className="h-3.5 w-3.5" />
                          Sick Leave
                        </span>
                      )}
                      {item.leaveType === 'Unpaid Leaves' && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                          <CalendarX className="h-3.5 w-3.5" />
                          Unpaid Leaves
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-semibold text-foreground">
                      {item.startDate.split('-').reverse().join('/')}
                    </td>

                    <td className="p-4 font-mono font-semibold text-foreground">
                      {item.endDate.split('-').reverse().join('/')}
                    </td>

                    <td className="p-4 font-mono font-bold text-foreground">
                      {item.daysCount} Days
                    </td>

                    <td className="p-4 text-foreground font-medium max-w-xs truncate">
                      {item.reason || 'Personal time off request'}
                    </td>

                    <td className="p-4">
                      {item.attachmentUrl ? (
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20"
                        >
                          <Paperclip className="h-3 w-3" />
                          View Certificate
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">None</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{filteredLeaves.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, filteredLeaves.length)}</span> of{' '}
            <span className="font-bold text-foreground">{filteredLeaves.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 text-xs font-bold gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-1 font-mono font-bold text-xs px-2">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 text-xs font-bold gap-1 cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* NEW Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg w-full max-w-[95vw] rounded-2xl border border-border bg-popover shadow-2xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Submit Time Off Application</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Request paid time off, sick leave, or unpaid leave. Attach certificate if applying for medical rest.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRequest} className="space-y-4 pt-2">
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
              <span className="font-semibold text-accent shrink-0">Total Requested Duration:</span>
              <span className="font-mono font-black text-sm text-foreground shrink-0">
                {String(calculatedDays).padStart(2, '0')}.00 Days
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
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
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <span className="shrink-0">✓ Attached:</span>
                  <span className="truncate flex-1">{attachmentUrl}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Reason / Notes</Label>
              <Input
                placeholder="Brief reason for time off..."
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
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
