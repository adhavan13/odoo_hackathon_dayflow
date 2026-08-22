'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  BarChart3,
  Bell,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeft,
  X,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useSidebarStore, UserRole } from '@/store';
import { Button } from '@/components/ui/button';

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

const adminNavConfig: NavGroup[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { title: 'Overview', href: '/admin/dashboard/overview' },
      { title: 'HR Analytics', href: '/admin/dashboard/hr-analytics' },
    ],
  },
  {
    title: 'Employee Management',
    icon: Users,
    items: [
      { title: 'All Employees', href: '/admin/employee-management/all-employees' },
      { title: 'Employee Profiles', href: '/admin/employee-management/employee-profiles' },
      { title: 'Departments', href: '/admin/employee-management/departments' },
    ],
  },
  {
    title: 'Attendance',
    icon: Clock,
    items: [
      { title: 'Attendance Overview', href: '/admin/attendance/overview' },
      { title: 'Daily Attendance', href: '/admin/attendance/daily-attendance' },
      { title: 'Attendance Reports', href: '/admin/attendance/reports' },
    ],
  },
  {
    title: 'Leave Management',
    icon: CalendarDays,
    items: [
      { title: 'Leave Requests', href: '/admin/leave-management/requests' },
      { title: 'Leave Calendar', href: '/admin/leave-management/calendar' },
      { title: 'Leave Reports', href: '/admin/leave-management/reports' },
    ],
  },
  {
    title: 'Payroll & Salary',
    icon: Banknote,
    items: [
      { title: 'Payroll Overview', href: '/admin/payroll/overview' },
      { title: 'Salary Structure', href: '/admin/payroll/salary-structure' },
      { title: 'Salary Slips', href: '/admin/payroll/salary-slips' },
    ],
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    items: [
      { title: 'Workforce Analytics', href: '/admin/reports/workforce-analytics' },
      { title: 'Attendance Analytics', href: '/admin/reports/attendance-analytics' },
      { title: 'Payroll Reports', href: '/admin/reports/payroll-reports' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { title: 'Alerts', href: '/admin/notifications/alerts' },
      { title: 'Announcements', href: '/admin/notifications/announcements' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      { title: 'Organization Settings', href: '/admin/settings/organization' },
      { title: 'Role & Permissions', href: '/admin/settings/roles-permissions' },
      { title: 'Profile', href: '/admin/settings/profile' },
    ],
  },
];

const employeeNavConfig: NavGroup[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { title: 'Overview', href: '/employee/dashboard/overview' },
      { title: 'Recent Activity', href: '/employee/dashboard/recent-activity' },
    ],
  },
  {
    title: 'My Profile',
    icon: User,
    items: [
      { title: 'Personal Information', href: '/employee/profile/personal-info' },
      { title: 'Job Details', href: '/employee/profile/job-details' },
      { title: 'Documents', href: '/employee/profile/documents' },
    ],
  },
  {
    title: 'Attendance',
    icon: Clock,
    items: [
      { title: 'My Attendance', href: '/employee/attendance/my-attendance' },
      { title: 'Check In / Check Out', href: '/employee/attendance/check-in-out' },
      { title: 'Attendance History', href: '/employee/attendance/history' },
    ],
  },
  {
    title: 'Leave & Time-Off',
    icon: CalendarDays,
    items: [
      { title: 'Apply for Leave', href: '/employee/leave/apply' },
      { title: 'My Leave Requests', href: '/employee/leave/requests' },
      { title: 'Leave Balance', href: '/employee/leave/balance' },
      { title: 'Leave Calendar', href: '/employee/leave/calendar' },
    ],
  },
  {
    title: 'Payroll & Salary',
    icon: Banknote,
    items: [
      { title: 'Salary Overview', href: '/employee/payroll/overview' },
      { title: 'Salary Details', href: '/employee/payroll/details' },
      { title: 'Salary Slips', href: '/employee/payroll/slips' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { title: 'Alerts', href: '/employee/notifications/alerts' },
      { title: 'Announcements', href: '/employee/notifications/announcements' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      { title: 'Account Settings', href: '/employee/settings/account' },
      { title: 'Profile Settings', href: '/employee/settings/profile' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user } = useAuthStore();
  const {
    isCollapsed,
    isMobileOpen,
    openGroups,
    toggleCollapse,
    setMobileOpen,
    toggleGroup,
  } = useSidebarStore();

  const activeRole: UserRole = pathname.startsWith('/employee')
    ? 'employee'
    : pathname.startsWith('/admin')
    ? 'admin'
    : role;

  const navConfig = activeRole === 'admin' ? adminNavConfig : employeeNavConfig;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="/logo.png"
            alt="Dayflow HRMS Logo"
            className="h-9 w-9 shrink-0 object-contain rounded-lg p-0.5 bg-card border border-border/40 shadow-xs"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-sidebar-foreground">Dayflow HRMS</span>
              <span className="text-[11px] text-muted-foreground truncate">Human Resource Suite</span>
            </div>
          )}
        </div>

        {/* Toggle Button for Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground group transition-colors cursor-pointer"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4 group-hover:text-accent-foreground" />
          ) : (
            <PanelLeftClose className="h-4 w-4 group-hover:text-accent-foreground" />
          )}
        </Button>

        {/* Close Button for Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground group transition-colors cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4 group-hover:text-accent-foreground" />
        </Button>
      </div>

      {/* Portal Indicator */}
      <div className="p-3 border-b border-sidebar-border bg-sidebar-accent/40">
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Portal</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent font-medium border border-accent/30">
              {activeRole === 'admin' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Employee
                </>
              )}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="p-2 rounded-lg bg-accent/15 text-accent" title={`${activeRole === 'admin' ? 'Admin' : 'Employee'} Portal`}>
              {activeRole === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
        {navConfig.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroups.includes(group.title);
          const hasActiveChild = group.items.some((item) => pathname === item.href);

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Title Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                  hasActiveChild
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? group.title : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className={cn('h-4 w-4 shrink-0', hasActiveChild ? 'text-accent' : 'text-muted-foreground')} />
                  {!isCollapsed && <span className="truncate">{group.title}</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-muted-foreground">
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </span>
                )}
              </button>

              {/* Submenu Items */}
              {(!isCollapsed && isOpen) && (
                <div className="pl-8 pr-1 space-y-1 border-l border-sidebar-border/60 ml-4 my-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block px-3 py-1.5 text-xs rounded-md transition-colors truncate',
                          isActive
                            ? 'bg-accent/15 text-accent font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40'
                        )}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help & System Status Footer */}
      <div className="p-3 border-t border-sidebar-border mt-auto bg-sidebar-accent/20">
        {!isCollapsed ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                router.push(role === 'admin' ? '/admin/docs' : '/employee/docs');
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-accent shrink-0" />
              <span>Help & Documentation</span>
            </button>
            <div className="flex items-center justify-between px-2.5 pt-1 text-[11px] text-muted-foreground border-t border-sidebar-border/40">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operational</span>
              </span>
              <span className="font-mono text-[10px]">v1.0.0</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => router.push(role === 'admin' ? '/admin/docs' : '/employee/docs')}
              className="p-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
              title="Help & Documentation"
            >
              <HelpCircle className="h-4 w-4 text-accent" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-50">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
