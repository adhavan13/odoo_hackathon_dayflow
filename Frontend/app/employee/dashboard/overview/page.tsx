'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Mail,
  Play,
  Square,
  ArrowRight,
  TrendingUp,
  Sun,
  Moon,
  Umbrella,
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Flower2,
  PartyPopper,
  CalendarDays,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { useAuthStore, useAttendanceStore, useLeaveStore, useAnnouncementStore } from '@/store';
import { CheckOutModal } from '@/components/attendance/CheckOutModal';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { snackbar } from '@/utils/snackbar';

export default function EmployeeOverviewPage() {
  const { user } = useAuthStore();
  const { isCheckedIn, checkInTime, checkInTimestamp, fetchToday, checkIn, checkOut, records, fetchAttendance } =
    useAttendanceStore();
  const { leaves, fetchLeaves, balances, fetchBalances } = useLeaveStore();
  const { announcements, fetchAnnouncements } = useAnnouncementStore();

  const [isLoadingPunch, setIsLoadingPunch] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Today's Plan Checklist State
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Review daily shift schedule and attendance log', completed: true },
    { id: '2', text: 'Submit weekly timesheet and project status update', completed: false },
    { id: '3', text: 'Participate in team standup sync meeting', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    fetchToday();
    fetchAttendance();
    if (fetchLeaves) fetchLeaves();
    if (fetchBalances) fetchBalances();
    if (fetchAnnouncements) fetchAnnouncements();
  }, [fetchToday, fetchAttendance, fetchLeaves, fetchBalances, fetchAnnouncements]);

  // Live Timer Count-Up Effect when Checked In
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isCheckedIn) {
      const startTime = checkInTimestamp || Date.now();
      const updateTimer = () => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(Math.max(0, seconds));
      };
      updateTimer();
      timerId = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timerId);
  }, [isCheckedIn, checkInTimestamp]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  const timer = formatTimer(elapsedSeconds);

  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  const handlePunchToggle = async () => {
    if (isCheckedIn) {
      setIsCheckOutModalOpen(true);
      return;
    }
    setIsLoadingPunch(true);
    try {
      await checkIn();
    } catch (err: any) {
      snackbar.error(err?.message || 'Failed to update attendance punch status.');
    } finally {
      setIsLoadingPunch(false);
    }
  };

  // Checklist Helpers
  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText('');
    snackbar.success('Task added to Today\'s Plan');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Greeting Time Calculation
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Filter Leave Stats
  const myLeaves = (leaves || []).filter(
    (l) => l.employeeId === user?.id || l.employeeName === user?.name
  );
  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;

  const paidBal = balances?.find((b) => b.leaveType === 'Paid Time off') || { allocatedDays: 24, usedDays: 4 };
  const sickBal = balances?.find((b) => b.leaveType === 'Sick Leave') || { allocatedDays: 7, usedDays: 2 };

  // Mock Holiday Data with Lucide React Icons
  const upcomingHolidays = [
    { title: 'Ganesh Chaturthi', date: '14-Sep-2026, Monday', icon: Sparkles, color: 'text-purple-500 bg-purple-500/15 border-purple-500/30' },
    { title: 'Gandhi Jayanti', date: '02-Oct-2026, Friday', icon: Award, color: 'text-amber-500 bg-amber-500/15 border-amber-500/30' },
    { title: 'Ayudha Pooja', date: '19-Oct-2026, Monday', icon: Flower2, color: 'text-rose-500 bg-rose-500/15 border-rose-500/30' },
    { title: 'Deepavali', date: '01-Nov-2026, Sunday', icon: PartyPopper, color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30' },
  ];

  // Generate Current Week Schedule Days (Sun - Sat Timeline matching wireframe)
  const getWeeklySchedule = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayNum = d.getDate();
      const dayName = dayNames[i];
      const isToday = d.toDateString() === today.toDateString();
      const isWeekend = i === 0 || i === 6;

      // Find matching attendance record
      const matchRec = records.find((r) => r.date === dateStr);

      let statusText = isWeekend ? 'Weekend' : 'Present';
      let statusColor = isWeekend ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold';
      let hoursText = '';

      if (isWeekend) {
        hoursText = '';
      } else if (matchRec && matchRec.workHours) {
        hoursText = `${matchRec.workHours} Hrs`;
      } else if (isToday && isCheckedIn) {
        const hrs = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
        hoursText = `${hrs}:${mins} Hrs`;
      } else {
        // Fallback realistic shift hours matching wireframe
        const fallbackHours = ['08:56', '08:21', '08:25', '09:11', '08:12'];
        hoursText = `${fallbackHours[(i - 1) % 5] || '08:30'} Hrs`;
      }

      weekDays.push({
        dateStr,
        dayName,
        dayNum,
        isToday,
        isWeekend,
        statusText,
        statusColor,
        hoursText,
      });
    }

    const startStr = `${sunday.getDate()}-${monthNames[sunday.getMonth()]}-${sunday.getFullYear()}`;
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const endStr = `${saturday.getDate()}-${monthNames[saturday.getMonth()]}-${saturday.getFullYear()}`;

    return { weekDays, rangeText: `${startStr}  -  ${endStr}` };
  };

  const weekSchedule = getWeeklySchedule();

  return (
    <PageContainer
      title={`Welcome, ${user?.name || 'Employee'}`}
      subtitle="Personal Employee Dashboard — Shift punch, work plan, leave balances, and company schedule"
      badge="Overview"
    >
      <div className="space-y-6">
        {/* TOP ROW: PUNCH TIMER CARD (LEFT) & GREETING BANNER (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT CARD: Live Shift Check-in / Check-out Clock Card */}
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
            {/* Avatar & Employee Details */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-accent text-2xl overflow-hidden shadow-md">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.substring(0, 2).toUpperCase() || 'EM'
                  )}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
                    isCheckedIn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-400'
                  }`}
                  title={isCheckedIn ? 'Active Shift' : 'Punched Out'}
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-mono font-bold text-muted-foreground">
                  {user?.employeeId || user?.empCode || 'EQ-027'} - <span className="text-foreground">{user?.name}</span>
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold">
                  <span className={isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                    {isCheckedIn ? 'Status: In' : 'Status: Out'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Clock Timer Counter (04 : 52 : 41) */}
            <div className="bg-muted/40 border border-border/80 rounded-2xl px-6 py-3 space-y-1 w-full max-w-[240px]">
              <div className="flex items-center justify-center gap-2 text-2xl font-black font-mono tracking-wider text-foreground">
                <span className="bg-card px-2.5 py-1 rounded-xl border border-border">{timer.hrs}</span>
                <span className="text-accent animate-pulse">:</span>
                <span className="bg-card px-2.5 py-1 rounded-xl border border-border">{timer.mins}</span>
                <span className="text-accent animate-pulse">:</span>
                <span className="bg-card px-2.5 py-1 rounded-xl border border-border">{timer.secs}</span>
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {isCheckedIn ? 'Active Work Shift' : 'Hours Logged Today'}
              </p>
            </div>

            {/* Punch In / Check Out Action Button */}
            <Button
              onClick={handlePunchToggle}
              disabled={isLoadingPunch}
              className={`w-full max-w-[240px] h-10 text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                isCheckedIn
                  ? 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
              }`}
            >
              {isCheckedIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Square className="h-4 w-4 fill-current" /> Check-out
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 fill-current" /> Check-in
                </span>
              )}
            </Button>
          </div>

          {/* RIGHT BANNER: Greeting Card & Quick Stats */}
          <div className="lg:col-span-8 space-y-4 flex flex-col justify-start">
            {/* Top Warm Greeting Card */}
            <div className="rounded-2xl border border-border bg-gradient-to-r from-accent/15 via-card to-accent/5 p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30 flex items-center gap-1.5">
                    {currentHour < 18 ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                    Dayflow HRMS
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {greeting}, <span className="text-accent">{user?.name}</span>
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Have a productive day! Check your daily deliverables, attendance, and team schedule.
                </p>
              </div>

              <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sun className="h-9 w-9 text-amber-500 animate-spin-slow" />
              </div>
            </div>

            {/* 4 Stat Overview Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">Today's Punch</p>
                <p className="text-base font-extrabold text-foreground font-mono">
                  {checkInTime || (isCheckedIn ? 'Logged In' : 'Not In')}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Shift 09:00 AM
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">Paid Time Off</p>
                <p className="text-base font-extrabold text-foreground font-mono">
                  {paidBal.allocatedDays - paidBal.usedDays} Days
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {paidBal.usedDays} days used of {paidBal.allocatedDays}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">Sick Leaves</p>
                <p className="text-base font-extrabold text-foreground font-mono">
                  {sickBal.allocatedDays - sickBal.usedDays} Days
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {sickBal.usedDays} days used of {sickBal.allocatedDays}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">Pending Requests</p>
                <p className="text-base font-extrabold text-foreground font-mono">{pendingLeaves}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  Awaiting review
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WORK SCHEDULE WEEKLY TIMELINE CARD (MATCHING WIREFRAME IMAGE) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold border border-accent/25">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground tracking-tight">Work Schedule</h3>
                <p className="text-xs font-mono text-muted-foreground font-semibold">{weekSchedule.rangeText}</p>
              </div>
            </div>

            <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30 hidden sm:inline-flex">
              Shift Schedule
            </span>
          </div>

          {/* General A Shift Plan Bar */}
          <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-foreground tracking-tight">General A</p>
              <p className="text-xs font-mono text-muted-foreground font-bold">10:00 AM - 6:00 PM</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 w-fit">
              Assigned Shift
            </span>
          </div>

          {/* Timeline & Connector Nodes */}
          <div className="relative pt-4 pb-2">
            {/* Connecting Line */}
            <div className="absolute top-[26px] left-[5%] right-[5%] h-[2px] bg-border/80 z-0" />

            {/* 7 Days Columns */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 relative z-10 text-center">
              {weekSchedule.weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2 group">
                  {/* Connector Dot */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`h-3 w-3 rounded-full border-2 border-card transition-all ${
                        day.isToday
                          ? 'bg-accent shadow-[0_0_10px_rgba(59,130,246,0.8)] scale-125'
                          : 'bg-muted-foreground/40 group-hover:bg-accent'
                      }`}
                    />
                    <div className="absolute -top-3 h-3 w-[1px] border-l border-dashed border-muted-foreground/40" />
                  </div>

                  {/* Day Name & Date Number */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground font-semibold text-[11px] sm:text-xs">{day.dayName}</span>
                    <span
                      className={`font-bold text-[11px] sm:text-xs ${
                        day.isToday
                          ? 'bg-accent text-accent-foreground px-1.5 py-0.5 rounded-md shadow-2xs'
                          : 'text-foreground'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>

                  {/* Status & Work Hours */}
                  <div className="space-y-0.5 text-center">
                    <p className={`text-[10px] sm:text-[11px] ${day.statusColor}`}>{day.statusText}</p>
                    {day.hoursText && (
                      <p className="text-[10px] sm:text-[11px] font-mono font-extrabold text-foreground">{day.hoursText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: UPCOMING HOLIDAYS (MATCHING SCREENSHOT CARD) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                <Umbrella className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Upcoming Holidays</h3>
                <p className="text-xs text-muted-foreground">Official company holiday calendar and upcoming breaks</p>
              </div>
            </div>

            <Link href="/employee/leave/calendar" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {upcomingHolidays.map((holiday, idx) => {
              const IconComp = holiday.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:border-accent/60 hover:bg-accent/5 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${holiday.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/20">
                      Holiday
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground group-hover:text-accent transition-colors">
                      {holiday.title}
                    </h4>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{holiday.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LATEST COMPANY ANNOUNCEMENTS WIDGET (EASY NOTIFICATION) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Latest Company Announcements</h3>
                <p className="text-xs text-muted-foreground">Official broadcasts and company policy updates</p>
              </div>
            </div>

            <Link href="/employee/notifications/announcements" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View all announcements →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 2).map((anc) => (
              <div
                key={anc.id}
                className="p-4 rounded-xl border border-border bg-muted/20 hover:border-accent/50 transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                      {anc.category}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{anc.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{anc.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{anc.content}</p>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex justify-between">
                  <span>By {anc.authorName}</span>
                  <Link href="/employee/notifications/announcements" className="text-accent font-bold hover:underline">Read →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: RECENT ATTENDANCE LOGS WITH WORK SUMMARY NOTES */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <h3 className="font-extrabold text-sm text-foreground">Recent Shift Attendance & Work Logs</h3>
            </div>
            <Link href="/employee/attendance/my-attendance" className="text-xs font-bold text-accent hover:underline">
              History →
            </Link>
          </div>

          <div className="rounded-xl border border-border/80 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Punch In</th>
                  <th className="p-3">Punch Out</th>
                  <th className="p-3">Work Summary & Daily Deliverables</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.slice(0, 5).map((rec, idx) => (
                  <tr key={rec.id || idx} className="hover:bg-muted/20 transition-colors font-medium">
                    <td className="p-3 font-mono font-bold text-foreground shrink-0">{rec.date}</td>
                    <td className="p-3 font-mono text-accent">{rec.checkIn || '09:00 AM'}</td>
                    <td className="p-3 font-mono text-muted-foreground">{rec.checkOut || '06:00 PM'}</td>
                    <td className="p-3 text-xs text-foreground/90 max-w-md">
                      {rec.workSummaryNote ? (
                        <p className="line-clamp-2 text-xs font-medium text-foreground bg-muted/30 p-2 rounded-lg border border-border/60">
                          {rec.workSummaryNote}
                        </p>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">No summary recorded</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : rec.status === 'Late'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Check Out Work Summary Note Modal */}
      <CheckOutModal isOpen={isCheckOutModalOpen} onClose={() => setIsCheckOutModalOpen(false)} />
    </PageContainer>
  );
}
