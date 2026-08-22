'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  ShieldCheck,
  ArrowRight,
  User,
} from 'lucide-react';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { loginWithBackend } = useAuthStore();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [tokenParam, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      snackbar.error('Reset token is missing or invalid.');
      return;
    }

    if (!password.trim() || password.length < 8) {
      snackbar.error('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      snackbar.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Call Backend reset-password endpoint with token & new password
      await api.post('/auth/reset-password', { token: token.trim(), password });
      setIsSuccess(true);
      snackbar.success('Password set successfully! Logging into Employee Portal...');

      // Step 2: Auto log-in with new password
      if (email.trim()) {
        try {
          const loggedUser = await loginWithBackend(email.trim(), password);
          setTimeout(() => {
            window.location.href = loggedUser.role === 'admin' ? '/admin/dashboard/employees' : '/employee/dashboard/overview';
          }, 800);
          return;
        } catch {
          // Fallback redirect to sign in
        }
      }

      setTimeout(() => {
        window.location.href = '/employee/dashboard/overview';
      }, 1000);
    } catch (error: any) {
      snackbar.error(error?.message || 'Failed to set password. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col lg:flex-row selection:bg-accent selection:text-accent-foreground">
      {/* Left Column: Branding Showcase */}
      <div className="lg:w-1/2 h-full bg-gradient-to-br from-accent/25 via-background to-accent/10 border-b lg:border-b-0 lg:border-r border-border p-6 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Dayflow Logo"
            className="h-12 w-12 object-contain rounded-2xl bg-card p-1 border border-border shadow-lg"
          />
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-foreground">Dayflow</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Employee Credentials & Password Setup</p>
          </div>
        </div>

        <div className="relative z-10 my-6 lg:my-0 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Secure Employee Account Invitation</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Set Your Password & Access Your Workspace
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome to the team! Create a secure password below to activate your employee portal access, view shift schedules, submit leave requests, and view salary slips.
          </p>

          <div className="p-4 rounded-xl bg-card/70 backdrop-blur border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Security Guarantee</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your password is encrypted using bcrypt hashing. Dayflow administrators never store or see your raw password.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            <span>Dayflow Employee Onboarding</span>
          </div>
          <span className="text-[11px]">Direct Portal Activation</span>
        </div>
      </div>

      {/* Right Column: Password Setup Form */}
      <div className="lg:w-1/2 h-full overflow-y-auto p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Employee Password</h2>
            {email && (
              <p className="text-xs text-muted-foreground">
                Setting up account password for <span className="font-semibold text-accent">{email}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Reset Token Input if not passed via URL */}
                {!tokenParam && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Reset Token</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Paste invitation token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="pl-9 h-10 text-xs bg-muted/20 font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 chars (A-Z, a-z, 0-9)"
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

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10 h-10 text-xs bg-muted/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? 'Activating Account...' : 'Set Password & Access Portal →'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Account Password Activated!</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Redirecting to Employee Dashboard...
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/employee/dashboard/overview'}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  Go to Employee Portal <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="pt-3 border-t border-border/60 text-center text-xs">
              <p className="text-muted-foreground">
                Already set your password?{' '}
                <Link href="/" className="font-semibold text-accent hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading reset page...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
