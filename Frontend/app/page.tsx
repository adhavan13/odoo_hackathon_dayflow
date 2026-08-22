'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  Building2,
  Clock,
  Banknote,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useAuthStore, UserRole } from '@/store';
import { snackbar } from '@/utils/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RootSignInPage() {
  const [role, setRole] = useState<UserRole>('employee');
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdOrEmail.trim() || !password.trim()) {
      snackbar.error('Please enter both Login ID/Email and Password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const mockUser = {
        id: role === 'admin' ? 'usr_admin_01' : 'usr_emp_02',
        name: role === 'admin' ? 'Sarah Jenkins' : 'Alex Rivera',
        email: loginIdOrEmail.includes('@') ? loginIdOrEmail : `${loginIdOrEmail.toLowerCase()}@company.com`,
        role: role,
        avatarUrl:
          role === 'admin'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: role === 'admin' ? 'Human Resources' : 'Software Engineering',
        designation: role === 'admin' ? 'HR Officer / Admin' : 'Senior Frontend Developer',
      };

      setAuth(mockUser, 'mock_jwt_token_' + Date.now());
      snackbar.success(`Welcome back, ${mockUser.name}!`);
      setIsLoading(false);

      if (typeof window !== 'undefined') {
        window.location.href = role === 'admin' ? '/admin/dashboard/overview' : '/employee/dashboard/overview';
      }
    }, 500);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col lg:flex-row selection:bg-accent selection:text-accent-foreground">
      {/* Left Column: Project Showcase Hero Banner (Fixed) */}
      <div className="lg:w-1/2 h-full bg-gradient-to-br from-accent/25 via-background to-accent/10 border-b lg:border-b-0 lg:border-r border-border p-6 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Glow backdrop decorative circle */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Dayflow Logo"
            className="h-12 w-12 object-contain rounded-2xl bg-card p-1 border border-border shadow-lg"
          />
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-foreground">Dayflow</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Human Resource Management System</p>
          </div>
        </div>

        {/* Center Hero Showcase */}
        <div className="relative z-10 my-6 lg:my-0 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30">
            <Zap className="h-3.5 w-3.5" />
            <span>Every workday, perfectly aligned</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Streamline Workforce Operations & Payroll
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enterprise-grade HRMS digitizing employee onboarding, automated Login ID generation, shift attendance tracking, leave workflows, and real-time wage computations.
          </p>

          {/* Key Feature Cards */}
          <div className="space-y-2.5 pt-1 hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Auto-Generated Login IDs</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Standard format: <code className="font-mono text-accent font-semibold">OIJODO20260001</code> for instant employee onboarding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Shift & Attendance Management</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  One-click daily check-in / check-out logs and leave approval workflows.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Automated Salary Computation</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dynamic calculation of Basic, HRA, LTA, Bonus, PF contributions & Tax deductions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            <span>Dayflow HRMS Platform</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Vercel Ready & Active
          </span>
        </div>
      </div>

      {/* Right Column: Sign In Form Section (Scrollable inside form side only) */}
      <div className="lg:w-1/2 h-full overflow-y-auto p-6 sm:p-10 lg:p-12 flex flex-col justify-start lg:justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Header Note */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign In to Your Account</h2>
            <p className="text-xs text-muted-foreground">Select your portal role and enter your credentials below</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'employee'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Employee Sign In
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin / HR Sign In
            </button>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Login ID or Email Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {role === 'employee' ? 'Employee Login ID / Email' : 'Admin Login ID / Email'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={
                      role === 'employee'
                        ? 'e.g. OIJODO20260001 or alex.rivera@company.com'
                        : 'e.g. sarah.j@company.com'
                    }
                    value={loginIdOrEmail}
                    onChange={(e) => setLoginIdOrEmail(e.target.value)}
                    className="pl-9 h-10 text-xs bg-muted/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 text-xs bg-muted/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? 'Signing In...' : `SIGN IN AS ${role === 'admin' ? 'ADMIN' : 'EMPLOYEE'}`}
              </Button>
            </form>

            {/* Role-Specific Sign Up Link */}
            <div className="pt-3 border-t border-border/60 text-center text-xs">
              {role === 'admin' ? (
                <p className="text-muted-foreground">
                  Don&apos;t have an Admin Account?{' '}
                  <Link href="/auth/admin-signup" className="font-semibold text-accent hover:underline">
                    Sign Up Now
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Are you an HR Admin?{' '}
                  <Link href="/auth/admin-signup" className="font-semibold text-accent hover:underline">
                    Register Organization Account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
