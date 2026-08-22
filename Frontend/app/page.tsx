'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';

export type Section = 'overview' | 'pipeline' | 'deals' | 'team' | 'reports' | 'customers' | 'forecasting' | 'settings';

export default function Home() {
  const { switchRole } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent selection:text-accent-foreground">
      {/* Top Banner */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-xl shadow-md">
            D
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none">Dayflow</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Human Resource Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Theme Supported & Mobile Responsive</span>
        </div>
      </header>

      {/* Main Hero Selection */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto my-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-6 border border-accent/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Dual Portal System Integrated with Zustand Store</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Select Your Portal Experience
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mt-3 mb-10">
          Streamlined Human Resource Management System with custom sidebars, responsive layouts, and full TypeScript integration.
        </p>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Admin Card */}
          <div className="group relative rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:shadow-xl hover:border-accent/50 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Management View</span>
                <h3 className="text-xl font-bold text-card-foreground mt-1">👨‍💼 Admin / HR Officer</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Full control over workforce analytics, employee directory, leave approvals, payroll structures, attendance logs, and organization settings.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60">
              <Button
                asChild
                className="w-full justify-between bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => switchRole('admin')}
              >
                <Link href="/admin/dashboard/overview">
                  Enter Admin Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Employee Card */}
          <div className="group relative rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:shadow-xl hover:border-accent/50 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Self-Service View</span>
                <h3 className="text-xl font-bold text-card-foreground mt-1">👤 Employee Portal</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Personal shift check-in/out, leave requests & balances, payslip downloads, personal documents, and account settings.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60">
              <Button
                asChild
                variant="outline"
                className="w-full justify-between border-accent/40 text-foreground hover:bg-accent/10"
                onClick={() => switchRole('employee')}
              >
                <Link href="/employee/dashboard/overview">
                  Enter Employee Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          <span>Dayflow — Human Resource Management System</span>
        </div>
      </footer>
    </div>
  );
}
