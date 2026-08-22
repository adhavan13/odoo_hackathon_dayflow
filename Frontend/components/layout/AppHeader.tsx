'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  UserCheck,
  User,
  LogOut,
  Bot,
  Clock,
} from 'lucide-react';
import { useAuthStore, useSidebarStore, useAppStore, useAttendanceStore } from '@/store';
import { useAiAssistantStore } from '@/store/useAiAssistantStore';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckOutModal } from '@/components/attendance/CheckOutModal';
import { snackbar } from '@/utils/snackbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function LiveShiftTimer({ timestamp }: { timestamp: number | null }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!timestamp) return;

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - timestamp);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      setElapsed(`${hh}:${mm}:${ss}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span
      suppressHydrationWarning
      className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1"
    >
      <Clock className="h-3 w-3 animate-spin text-emerald-500" />
      {elapsed}
    </span>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, logout } = useAuthStore();
  const { toggleMobileOpen } = useSidebarStore();
  const { announcements, fetchAnnouncements } = useAnnouncementStore();
  const { unreadCount } = useAppStore();

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const notificationCount = announcements.length > 0 ? announcements.length : unreadCount;
  const { toggleOpen: toggleAiAssistant } = useAiAssistantStore();
  const { isCheckedIn, checkInTime, checkInTimestamp, checkIn, checkOut } = useAttendanceStore();

  const [mounted, setMounted] = useState(false);
  // Sync profile directly from localStorage and auth store
  const [activeUser, setActiveUser] = useState(user);

  useEffect(() => {
    setMounted(true);
    const syncProfile = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setActiveUser(parsed);
            return;
          } catch {}
        }
      }
      setActiveUser(user);
    };

    syncProfile();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', syncProfile);
      window.addEventListener('auth_user_updated', syncProfile);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', syncProfile);
        window.removeEventListener('auth_user_updated', syncProfile);
      }
    };
  }, [user]);

  const activeRole = pathname.startsWith('/employee')
    ? 'employee'
    : pathname.startsWith('/admin')
    ? 'admin'
    : activeUser?.role || role;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  const getBreadcrumbTitle = (): string => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Overview';
    const last = segments[segments.length - 1];
    return last
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleMyProfileClick = () => {
    if (activeRole === 'admin') {
      router.push('/admin/profile');
    } else {
      router.push('/employee/profile');
    }
  };

  const handleConfirmLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    logout();
    snackbar.info('Logged out successfully');
    setShowLogoutConfirm(false);
    router.push('/');
  };

  const displayAvatar = mounted && user?.avatarUrl ? user.avatarUrl : '/user.png';
  const displayName = mounted && user?.name ? user.name : 'User';

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-3 sm:px-4 md:px-6 w-full max-w-full overflow-hidden">
        {/* Left Section: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-accent hover:text-accent-foreground group transition-colors cursor-pointer shrink-0"
            onClick={toggleMobileOpen}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5 group-hover:text-accent-foreground" />
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span className="capitalize shrink-0 hidden sm:inline">{activeRole} Portal</span>
            <span className="shrink-0 hidden sm:inline">/</span>
            <span className="font-bold sm:font-semibold text-foreground text-sm sm:text-xs truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="hidden lg:flex items-center w-64 xl:w-80 relative mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees, requests, reports..."
            className="pl-9 h-9 text-xs bg-muted/40 focus-visible:bg-background"
          />
        </div>

        {/* Right Section: Actions & Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Systray Check IN / Check OUT Widget */}
          <div className="hidden sm:flex items-center gap-2 p-1 pl-2.5 pr-1 rounded-full border border-border/80 bg-muted/30 backdrop-blur shadow-2xs shrink-0">
            <div className="flex items-center gap-1.5" title={isCheckedIn ? `Checked IN since ${checkInTime || '09:00 AM'}` : 'Checked OUT'}>
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
                  isCheckedIn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                }`}
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:inline">
                {isCheckedIn ? 'Online' : 'Offline'}
              </span>
            </div>

            {isCheckedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-0.5">
                <div className="hidden sm:block">
                  <LiveShiftTimer timestamp={checkInTimestamp} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCheckOutModalOpen(true)}
                  className="h-7 text-[11px] sm:text-xs px-2.5 sm:px-3 font-extrabold rounded-full border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:text-white cursor-pointer transition-all shadow-2xs gap-1"
                >
                  Check OUT →
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={checkIn}
                className="h-7 text-[11px] sm:text-xs px-3 sm:px-3.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs gap-1 font-extrabold transition-all"
              >
                Check IN →
              </Button>
            )}
          </div>

          {/* AI Assistant Quick Launcher Button */}
          <Button
            onClick={toggleAiAssistant}
            type="button"
            className="hidden md:flex items-center gap-1.5 h-8 px-3 bg-accent/15 hover:bg-accent/25 border border-accent/30 rounded-full text-xs font-bold text-accent transition-all duration-200 cursor-pointer shadow-2xs shrink-0"
          >
            <Bot className="h-4 w-4 text-accent" />
            <span className="font-bold text-xs tracking-tight">Ask AI</span>
          </Button>

          {/* Notifications Icon with Badge */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex relative text-foreground hover:bg-accent hover:text-accent-foreground group transition-colors cursor-pointer shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => {
              const targetRoute = activeRole === 'admin'
                ? '/admin/notifications/announcements'
                : '/employee/notifications/announcements';
              router.push(targetRoute);
            }}
            title="View Announcements & Notifications"
          >
            <Bell className="h-4 w-4 group-hover:text-accent-foreground" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="app-header-user-menu-trigger">
              <button
                id="app-header-user-menu-button"
                type="button"
                suppressHydrationWarning
                className="flex items-center gap-2 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-full p-0.5 transition-colors hover:bg-muted/50 shrink-0"
              >
                <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                  {mounted && activeUser?.avatarUrl ? (
                    <img
                      src={activeUser.avatarUrl}
                      alt={activeUser.name || 'User'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{(activeUser?.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span suppressHydrationWarning className="text-xs font-semibold leading-tight text-foreground max-w-[110px] truncate">
                    {mounted ? (activeUser?.name || 'User') : 'Loading...'}
                  </span>
                  <span suppressHydrationWarning className="text-[10px] text-muted-foreground capitalize max-w-[110px] truncate">
                    {mounted ? (activeUser?.designation || activeRole) : ''}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mt-1 p-2 shadow-xl border-border bg-card">
              <DropdownMenuLabel className="font-normal p-2.5 rounded-lg bg-accent/5 border border-accent/15">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-sm overflow-hidden shrink-0 shadow-2xs">
                    {activeUser?.avatarUrl ? (
                      <img
                        src={activeUser.avatarUrl}
                        alt={activeUser.name || 'User Profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{(activeUser?.name || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold leading-tight text-foreground truncate">
                        {activeUser?.name || 'User Profile'}
                      </p>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent shrink-0">
                        {activeUser?.role || activeRole}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{activeUser?.email || 'No email registered'}</p>
                    {activeUser?.designation && (
                      <p className="text-[11px] font-medium text-foreground/80 truncate mt-1">
                        {activeUser.designation}
                      </p>
                    )}
                    {activeUser?.department && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {activeUser.department}
                      </p>
                    )}
                    {activeUser?.employeeId && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded w-fit border border-accent/20">
                        <span>ID:</span>
                        <span>{activeUser.employeeId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem onClick={handleMyProfileClick} className="group cursor-pointer gap-2 py-2 focus:bg-accent focus:text-accent-foreground">
                <User className="h-4 w-4 shrink-0 text-accent group-focus:text-accent-foreground group-hover:text-accent-foreground transition-colors" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">My Profile & Settings</span>
                  <span className="text-[10px] text-muted-foreground group-focus:text-accent-foreground/80 group-hover:text-accent-foreground/80 transition-colors">
                    View personal details & security
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowLogoutConfirm(true)}
                className="cursor-pointer gap-2 py-2"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-base font-bold text-foreground">Confirm Log Out</AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-sm font-medium text-foreground/90 dark:text-foreground/95 leading-relaxed">
                  Are you sure you want to log out of your Dayflow HRMS session? This will clear your current local session data.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="cursor-pointer hover:bg-muted hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Check Out Work Summary Note Modal */}
      <CheckOutModal isOpen={isCheckOutModalOpen} onClose={() => setIsCheckOutModalOpen(false)} />
    </>
  );
}
