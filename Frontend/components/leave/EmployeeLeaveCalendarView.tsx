'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Palmtree,
  Stethoscope,
  CalendarX,
  Info,
  Plus,
  Upload,
  Paperclip,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store';
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

export function EmployeeLeaveCalendarView() {
  const { user } = useAuthStore();
  const { leaves, holidays, fetchLeaves, fetchHolidays, applyLeave } = useLeaveStore();

  useEffect(() => {
    fetchLeaves();
    fetchHolidays();
  }, [fetchLeaves, fetchHolidays]);

  const allHolidays = holidays && holidays.length > 0 ? holidays : PUBLIC_HOLIDAYS_2026;

  const myLeaves = leaves.filter(
    (l) =>
      l.employeeId === (user?.id || 'usr_emp_02') ||
      l.employeeId === user?.employeeId ||
      l.employeeName === user?.name ||
      l.employeeName === 'Alex Rivera'
  );

  // Date Modal State
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-25');
  const [activeTab, setActiveTab] = useState<'info' | 'apply'>('info');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Apply Leave Form State
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
    if (holiday) return { type: 'holiday' as const, holidayName: holiday.name };

    const activeLeaves = myLeaves.filter((l) => dateStr >= l.startDate && dateStr <= l.endDate);
    if (activeLeaves.length > 0) {
      const first = activeLeaves[0];
      return {
        type: 'leave' as const,
        leaveItem: first,
      };
    }
    return { type: 'blank' as const };
  };

  // Date Click Handler
  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setStartDate(dateStr);
    setEndDate(dateStr);
    const meta = getDateMetadata(dateStr);
    if (meta.type === 'blank') {
      setActiveTab('apply');
    } else {
      setActiveTab('info');
    }
    setIsModalOpen(true);
  };

  const activeDateMeta = getDateMetadata(selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Banner & Action Bar */}
      <div className="p-5 rounded-2xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Interactive Time Off Calendar (2026)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any date to view status details or quickly apply for leave on that day.
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => handleDateClick('2026-08-25')}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs h-10 px-5 gap-2 rounded-xl cursor-pointer shadow-md shrink-0"
        >
          <Plus className="h-4 w-4" />
          Apply for Time Off
        </Button>
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
                    let badgeTitle = `Click to view or apply for leave on ${dateStr}`;

                    if (meta.type === 'holiday') {
                      bgClass = 'bg-accent/20 text-accent font-bold rounded-lg border border-accent/30 shadow-xs';
                      badgeTitle = `Public Holiday: ${meta.holidayName}`;
                    } else if (meta.type === 'leave' && meta.leaveItem) {
                      const item = meta.leaveItem;
                      if (item.status === 'Approved') {
                        bgClass = 'bg-emerald-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Approved Leave: ${item.leaveType}`;
                      } else if (item.status === 'Pending') {
                        bgClass = 'bg-amber-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Pending Review: ${item.leaveType}`;
                      } else if (item.status === 'Rejected') {
                        bgClass = 'bg-rose-500 text-white font-bold rounded-lg shadow-xs';
                        badgeTitle = `Refused: ${item.leaveType}`;
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

        {/* Legend & Holidays Panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
              <span>Calendar Legend</span>
              <Info className="h-3.5 w-3.5 text-accent" />
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-emerald-500 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">Validated / Approved</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-amber-500 flex items-center justify-center shadow-xs">
                  <Clock className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">To Approve (Pending)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-rose-500 flex items-center justify-center shadow-xs">
                  <XCircle className="h-3 w-3 text-white" />
                </span>
                <span className="text-foreground">Refused / Rejected</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center shadow-xs">
                  <Sparkles className="h-3 w-3 text-accent" />
                </span>
                <span className="text-foreground">Public Holidays</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
              <span>Public Holidays ({allHolidays.length})</span>
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

      {/* UNIFIED DATE ACTION & INFO POPUP MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg w-full max-w-[95vw] rounded-2xl border border-border bg-popover shadow-2xl p-6 space-y-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-accent" />
              Calendar Date: {selectedDateStr.split('-').reverse().join('/')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              View schedule information or submit a leave request for this date.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Tab Controls */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Date Info & Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === 'apply'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Apply for Time Off
            </button>
          </div>

          {activeTab === 'info' ? (
            <div className="space-y-3 pt-1">
              {activeDateMeta.type === 'holiday' && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-2">
                  <div className="flex items-center gap-2 text-accent font-bold text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Official Public Holiday</span>
                  </div>
                  <p className="text-sm font-extrabold text-foreground">{activeDateMeta.holidayName}</p>
                  <p className="text-xs text-muted-foreground">No work required on this official holiday date.</p>
                </div>
              )}

              {activeDateMeta.type === 'leave' && activeDateMeta.leaveItem && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Applicant Name:</span>
                      <span className="font-bold text-foreground">{activeDateMeta.leaveItem.employeeName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leave Type:</span>
                      <span className="font-bold text-accent">{activeDateMeta.leaveItem.leaveType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Duration:</span>
                      <span className="font-mono font-bold text-foreground">{activeDateMeta.leaveItem.daysCount} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeDateMeta.leaveItem.status}</span>
                    </div>
                  </div>

                  {activeDateMeta.leaveItem.attachmentUrl && (
                    <a
                      href={activeDateMeta.leaveItem.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between text-xs text-accent font-bold hover:underline"
                    >
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="h-4 w-4" />
                        Medical Certificate Attachment
                      </span>
                      <span>View File →</span>
                    </a>
                  )}
                </div>
              )}

              {activeDateMeta.type === 'blank' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border text-center space-y-2">
                  <p className="text-xs font-semibold text-foreground">Regular Workday Schedule</p>
                  <p className="text-[11px] text-muted-foreground">No leave or holiday recorded for this date.</p>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('apply')}
                    className="bg-accent text-accent-foreground font-bold text-xs h-9 px-4 gap-1.5 rounded-xl mt-2 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Apply for Time Off on This Date
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4 pt-1">
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
                      <span>{isUploading ? 'Uploading to Cloudinary...' : attachmentUrl ? 'Change File' : 'Upload Document'}</span>
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
