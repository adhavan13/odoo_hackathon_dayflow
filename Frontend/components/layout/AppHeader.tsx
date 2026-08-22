'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuthStore, useSidebarStore, useAppStore } from '@/store';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { snackbar } from '@/utils/snackbar';

export function AppHeader() {
  const pathname = usePathname();
  const { role, switchRole, user } = useAuthStore();
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

  const handleRoleToggle = () => {
    const targetRole = role === 'admin' ? 'employee' : 'admin';
    switchRole(targetRole);
    snackbar.info(`Switched to ${targetRole === 'admin' ? '👨‍💼 Admin / HR Officer' : '👤 Employee'} portal view.`);
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

      {/* Right Section: Actions & Role Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Role Quick Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRoleToggle}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium border-accent/40 hover:bg-accent/10"
        >
          {role === 'admin' ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>👨‍💼 Admin View</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5 text-accent" />
              <span>👤 Employee View</span>
            </>
          )}
        </Button>

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

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              'US'
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight">{user?.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
