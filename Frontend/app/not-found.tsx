'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, FileQuestion, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export default function NotFound() {
  const router = useRouter();
  const { user, role } = useAuthStore();
  const [dashboardUrl, setDashboardUrl] = useState('/auth/login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user');
      let activeRole = role;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          activeRole = parsed.role?.toLowerCase() || role;
        } catch {}
      }

      if (activeRole === 'admin') {
        setDashboardUrl('/admin/dashboard/employees');
      } else if (activeRole === 'employee') {
        setDashboardUrl('/employee/dashboard/overview');
      } else {
        setDashboardUrl('/auth/login');
      }
    }
  }, [role]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-accent selection:text-accent-foreground">
      {/* Glow backdrop decorative gradient circles */}
      <div className="absolute top-1/4 -left-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Header Logo */}
        <div className="inline-flex items-center gap-3 bg-card/60 backdrop-blur p-2 px-4 rounded-2xl border border-border shadow-xs">
          <img
            src="/logo.png"
            alt="Dayflow Logo"
            className="h-8 w-8 object-contain rounded-xl bg-card p-0.5 border border-border"
          />
          <span className="font-extrabold text-sm tracking-tight text-foreground">Dayflow HRMS</span>
        </div>

        {/* 404 Visual Icon Card */}
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xl space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="h-24 w-24 rounded-3xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30 shadow-md">
              <FileQuestion className="h-12 w-12 text-accent animate-bounce" />
            </div>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground shadow-xs">
              404
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold border border-accent/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>404 Error • Page Not Found</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Oops! Page Missing
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              The requested page could not be found or may have been moved. Please check the web address or return to your dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => router.push(dashboardUrl)}
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-extrabold h-10 px-5 gap-2 shadow-md cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Button>

            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold h-10 px-5 gap-2 border-border hover:bg-muted cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Sign In Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground font-medium">
          Dayflow Human Resource Management System
        </p>
      </div>
    </div>
  );
}
