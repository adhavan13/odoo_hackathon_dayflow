'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogIn,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userRole: 'ADMIN' | 'HR' | 'EMPLOYEE';
  action: string;
  category: 'attendance' | 'leave' | 'profile' | 'auth';
  description: string;
  timestamp: string;
}

export interface ActivityAnalytics {
  total: number;
  attendanceCount: number;
  leaveCount: number;
  profileCount: number;
  authCount: number;
  approvedLeaves: number;
  pendingLeaves: number;
  lastActivityTime?: string;
}

const fallbackActivities: ActivityItem[] = [
  {
    id: 'act_101',
    userId: 'usr_emp_02',
    userName: 'Alex Rivera',
    userRole: 'EMPLOYEE',
    action: 'LEAVE_APPLIED',
    category: 'leave',
    description: 'Submitted a 2-day Paid Time Off application for May 13 - May 14',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'act_102',
    userId: 'usr_admin_01',
    userName: 'Sarah Jenkins',
    userRole: 'ADMIN',
    action: 'LEAVE_APPROVED',
    category: 'leave',
    description: 'Approved Sick Leave request for Michael Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'act_103',
    userId: 'usr_emp_02',
    userName: 'Alex Rivera',
    userRole: 'EMPLOYEE',
    action: 'PUNCH_IN',
    category: 'attendance',
    description: 'Punched in for workday at 09:00 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'act_104',
    userId: 'usr_emp_03',
    userName: 'Michael Chen',
    userRole: 'EMPLOYEE',
    action: 'PUNCH_IN',
    category: 'attendance',
    description: 'Punched in for workday at 09:15 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: 'act_105',
    userId: 'usr_emp_02',
    userName: 'Alex Rivera',
    userRole: 'EMPLOYEE',
    action: 'PROFILE_UPDATED',
    category: 'profile',
    description: 'Updated personal skills and bio in profile section',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'act_106',
    userId: 'usr_admin_01',
    userName: 'Sarah Jenkins',
    userRole: 'ADMIN',
    action: 'LEAVE_REJECTED',
    category: 'leave',
    description: 'Refused leave request for Pam Beesly due to project deadline',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'act_107',
    userId: 'usr_emp_02',
    userName: 'Alex Rivera',
    userRole: 'EMPLOYEE',
    action: 'LOGIN',
    category: 'auth',
    description: 'Successfully logged in from web portal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const fallbackAnalytics: ActivityAnalytics = {
  total: 7,
  attendanceCount: 2,
  leaveCount: 3,
  profileCount: 1,
  authCount: 1,
  approvedLeaves: 1,
  pendingLeaves: 1,
};

export function RecentActivityView() {
  const [activities, setActivities] = useState<ActivityItem[]>(fallbackActivities);
  const [analytics, setAnalytics] = useState<ActivityAnalytics>(fallbackAnalytics);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [actRes, anaRes] = await Promise.all([
        api.get('/activity'),
        api.get('/activity/analytics'),
      ]);

      const actData = actRes.data?.data || actRes.data || actRes;
      if (Array.isArray(actData) && actData.length > 0) {
        setActivities(actData);
      }

      const anaData = anaRes.data?.data || anaRes.data;
      if (anaData && typeof anaData === 'object') {
        setAnalytics((prev) => ({ ...prev, ...anaData }));
      }
    } catch (err) {
      // Use fallback mock state when backend is starting or offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      act.userName.toLowerCase().includes(search.toLowerCase()) ||
      act.action.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || act.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'attendance':
        return { label: 'Attendance', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Clock };
      case 'leave':
        return { label: 'Leave & Time-Off', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Calendar };
      case 'profile':
        return { label: 'Profile Update', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: User };
      case 'auth':
        return { label: 'Authentication', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: LogIn };
      default:
        return { label: category, bg: 'bg-muted text-muted-foreground border-border', icon: Activity };
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `${mins <= 0 ? 1 : mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Counter Cards (Unified App Theme & Reduced Font Sizes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events Card */}
        <div className="p-4 rounded-xl border border-accent/30 bg-card flex items-center justify-between shadow-2xs hover:border-accent/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">Total Activity Events</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{analytics.total}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> System activity logged
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
        </div>

        {/* Attendance Punches */}
        <div className="p-4 rounded-xl border border-accent/30 bg-card flex items-center justify-between shadow-2xs hover:border-accent/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">Clock-ins & Punches</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{analytics.attendanceCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Daily timekeeping events</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Leave Requests */}
        <div className="p-4 rounded-xl border border-accent/30 bg-card flex items-center justify-between shadow-2xs hover:border-accent/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">Leave Applications</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{analytics.leaveCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{analytics.approvedLeaves} Approved, {analytics.pendingLeaves} Pending</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
        </div>

        {/* Profile & Auth Updates */}
        <div className="p-4 rounded-xl border border-accent/30 bg-card flex items-center justify-between shadow-2xs hover:border-accent/50 transition-all">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-wider">Profile & Auth Logs</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{analytics.profileCount + analytics.authCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Security & account audits</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recent activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-muted/20 rounded-xl"
            />
          </div>

          {/* Category Select Filter */}
          <div className="w-44">
            <CustomSelect
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Attendance', value: 'attendance' },
                { label: 'Leave & Time-Off', value: 'leave' },
                { label: 'Profile Updates', value: 'profile' },
                { label: 'Authentication', value: 'auth' },
              ]}
            />
          </div>

          {/* Refresh Data Button */}
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
            className="h-10 px-3.5 text-xs font-bold gap-2 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-accent ${isLoading ? 'animate-spin' : ''}`} />
            Sync API
          </Button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'timeline' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <Activity className="h-4 w-4 text-accent" />
            Timeline View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            Table View
          </button>
        </div>
      </div>

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Recent Activity Timeline Feed
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredActivities.length} logs
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs font-medium">
                No activity logs match your filter criteria.
              </div>
            ) : (
              filteredActivities.map((act) => {
                const catInfo = getCategoryBadge(act.category);
                const IconComp = catInfo.icon;

                return (
                  <div key={act.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-card border-2 border-accent flex items-center justify-center group-hover:scale-125 transition-transform shadow-xs">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>

                    {/* Content Box */}
                    <div className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{act.userName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
                            {act.userRole}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${catInfo.bg}`}>
                            <IconComp className="h-3 w-3" />
                            {catInfo.label}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-foreground">{act.description}</p>
                      
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono border-t border-border/40 pt-2 mt-1">
                        <span>Action: {act.action}</span>
                        <span>Date: {new Date(act.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => {
                    const catInfo = getCategoryBadge(act.category);
                    return (
                      <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-[11px]">
                              {act.userName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p>{act.userName}</p>
                              <span className="text-[10px] text-muted-foreground">{act.userRole}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${catInfo.bg}`}>
                            {catInfo.label}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-semibold text-accent">
                          {act.action}
                        </td>

                        <td className="p-4 text-foreground font-medium max-w-md truncate">
                          {act.description}
                        </td>

                        <td className="p-4 text-right font-mono text-muted-foreground">
                          {formatTimeAgo(act.timestamp)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
