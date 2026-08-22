'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Clock,
  Calendar,
  Banknote,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Play,
  Square,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore, useAttendanceStore, useLeaveStore } from '@/store';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { snackbar } from '@/utils/snackbar';

export default function EmployeeOverviewPage() {
  const { user } = useAuthStore();
  const { isCheckedIn, checkInTime, fetchToday, checkIn, checkOut } = useAttendanceStore();
  const { leaves, fetchLeaves } = useLeaveStore();

  const [isLoadingPunch, setIsLoadingPunch] = useState(false);

  useEffect(() => {
    fetchToday();
    if (fetchLeaves) fetchLeaves();
  }, [fetchToday, fetchLeaves]);

  const handlePunchToggle = async () => {
    setIsLoadingPunch(true);
    try {
      if (isCheckedIn) {
        await checkOut();
        snackbar.success('Punched out successfully for today.');
      } else {
        await checkIn();
        snackbar.success('Punched in successfully! Shift started.');
      }
    } catch (err: any) {
      snackbar.error(err?.message || 'Failed to update attendance punch status.');
    } finally {
      setIsLoadingPunch(false);
    }
  };

  // Filter leave requests belonging to this employee safely
  const myLeaves = (leaves || []).filter(
    (l) => l.employeeId === user?.id || l.employeeName === user?.name
  );
  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
  const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved').length;

  return (
    <PageContainer
      title={`Welcome back, ${user?.name || 'Employee'}`}
      subtitle="Personal Employee Portal — Track your shift attendance, leave balances, and salary slips"
      badge="Employee Portal"
    >
      <div className="space-y-6">
        {/* Top Profile Banner Card */}
        <div className="relative rounded-2xl border border-border bg-gradient-to-r from-accent/15 via-card to-accent/5 p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-accent text-xl sm:text-2xl overflow-hidden shrink-0 shadow-md">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-accent" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{user?.name}</h2>
                  {user?.employeeId && (
                    <span className="font-mono text-xs font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/30">
                      {user.employeeId}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-accent">{user?.designation || 'Software Engineer'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{user?.department || 'Software Engineering'}</span>
                  <span>•</span>
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Shift Punch Button */}
            <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 shrink-0">
              <Button
                onClick={handlePunchToggle}
                disabled={isLoadingPunch}
                className={`h-11 px-6 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                  isCheckedIn
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                }`}
              >
                {isCheckedIn ? (
                  <span className="flex items-center gap-2">
                    <Square className="h-4 w-4 fill-current" /> Punch Out Shift
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4 fill-current" /> Punch In Shift
                  </span>
                )}
              </Button>
              <div className="text-[11px] text-muted-foreground text-center sm:text-right font-medium">
                Status:{' '}
                <span className={`font-bold ${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  {isCheckedIn ? 'Active Shift (Punched In)' : 'Not Punched In'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Shift Attendance</span>
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {isCheckedIn ? 'Punched In' : 'Punched Out'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {checkInTime ? `In: ${checkInTime}` : 'Shift Hours: 09:00 AM - 06:00 PM'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Paid Leave Balance</span>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">12 Days</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {approvedLeaves} leave requests approved
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pending Requests</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{pendingLeaves}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting admin review</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly Salary</span>
              <Banknote className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">$4,500</div>
            <p className="text-[11px] text-muted-foreground">Net Pay • Salary slip available</p>
          </div>
        </div>

        {/* Detailed Info Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Profile Information Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <User className="h-4 w-4 text-accent" />
                <span>My Employee Profile</span>
              </div>
              <span className="text-[11px] font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
                Active Employee
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-bold text-foreground">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-mono font-bold text-accent">{user?.employeeId || 'EMP1001'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Corporate Email</span>
                <span className="font-semibold text-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Department</span>
                <span className="font-semibold text-foreground">{user?.department || 'Software Engineering'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Designation</span>
                <span className="font-semibold text-foreground">{user?.designation || 'Senior Frontend Developer'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Access Role</span>
                <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Employee</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>My Portal Quick Actions</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/employee/attendance/my-attendance"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground group-hover:text-accent transition-colors">My Attendance Records</h3>
                    <p className="text-[11px] text-muted-foreground">View punch in/out timestamps & shift history</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>

              <Link
                href="/employee/leave/apply"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground group-hover:text-accent transition-colors">Apply for Leave</h3>
                    <p className="text-[11px] text-muted-foreground">Submit leave applications & check approval status</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>

              <Link
                href="/employee/salary-slips/my-slips"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground group-hover:text-accent transition-colors">My Salary Slips</h3>
                    <p className="text-[11px] text-muted-foreground">Download monthly pay slips and tax breakdown</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
