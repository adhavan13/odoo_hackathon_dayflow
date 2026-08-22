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

  const handlePunchToggle = async () => {
    setIsLoadingPunch(true);
    try {
      if (isCheckedIn) {
        await checkOut();
      } else {
        await checkIn();
      }
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

        {/* BOTTOM ROW: TODAY'S PLAN & RECENT ATTENDANCE LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: TODAY'S PLAN & DELIVERABLES CHECKLIST */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent" />
                <h3 className="font-extrabold text-sm text-foreground">Today's Plan & Work Goals</h3>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground font-mono">
                {tasks.filter((t) => t.completed).length} / {tasks.length} Done
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5 my-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                    task.completed
                      ? 'bg-muted/40 border-border/60 text-muted-foreground line-through'
                      : 'bg-card border-border text-foreground hover:border-accent/40'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                    <span className="font-medium">{task.text}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                    title="Delete goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Task Input Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-border/60">
              <Input
                placeholder="Add a new work goal for today..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="h-9 text-xs bg-muted/20"
              />
              <Button type="submit" className="h-9 text-xs bg-accent text-accent-foreground font-bold px-3 shrink-0 cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </form>
          </div>

          {/* RIGHT: RECENT ATTENDANCE & SHIFT HISTORY */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <h3 className="font-extrabold text-sm text-foreground">Recent Shift Attendance Logs</h3>
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
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.slice(0, 4).map((rec, idx) => (
                    <tr key={rec.id || idx} className="hover:bg-muted/20 transition-colors font-medium">
                      <td className="p-3 font-mono font-bold text-foreground">{rec.date}</td>
                      <td className="p-3 font-mono text-accent">{rec.checkIn || '09:00 AM'}</td>
                      <td className="p-3 font-mono text-muted-foreground">{rec.checkOut || '06:00 PM'}</td>
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
      </div>
    </PageContainer>
  );
}
