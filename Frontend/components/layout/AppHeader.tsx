'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Bell, Search, ShieldCheck, UserCheck, User, LogOut } from 'lucide-react';
import { useAuthStore, useSidebarStore, useAppStore } from '@/store';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { snackbar } from '@/utils/snackbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, logout } = useAuthStore();
  const { toggleMobileOpen } = useSidebarStore();
  const { unreadCount } = useAppStore();

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
    if (role === 'admin') {
      router.push('/admin/profile');
    } else {
      router.push('/employee/profile');
    }
  };

  const handleLogout = () => {
    logout();
    snackbar.info('Logged out successfully');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      {/* Left Section: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground"
          onClick={toggleMobileOpen}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{role} Portal</span>
            <span>/</span>
            <span className="font-semibold text-foreground">{getBreadcrumbTitle()}</span>
          </div>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden lg:flex items-center w-72 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search employees, requests, reports..."
          className="pl-9 h-9 text-xs bg-muted/40 focus-visible:bg-background"
        />
      </div>

      {/* Right Section: Actions & Profile Dropdown */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Static Role View Badge (No switching inside portal) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {role === 'admin' ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin View</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Employee View</span>
            </>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground"
          onClick={() => snackbar.info(`You have ${unreadCount} unread notifications.`)}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 pl-2 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1 transition-colors hover:bg-muted/50"
            >
              <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.substring(0, 2).toUpperCase() || 'US'
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{role}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleMyProfileClick} className="cursor-pointer gap-2">
              <User className="h-4 w-4 text-accent" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
