'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Upload,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Zap,
  Clock,
  Banknote,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { snackbar } from '@/utils/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSignUpPage() {
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'company_logos' });
      setLogoUrl(res.secure_url);
      snackbar.success('Company logo uploaded successfully');
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setLogoUrl(localUrl);
      snackbar.info('Logo selected (preview mode)');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !name.trim() || !email.trim() || !password.trim()) {
      snackbar.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      snackbar.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      snackbar.error('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newAdmin = {
        id: 'usr_admin_' + Date.now(),
        name: name,
        email: email,
        role: 'admin' as const,
        avatarUrl: logoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: 'Human Resources & Executive',
        designation: 'HR Admin / Founder',
      };

      setAuth(newAdmin, 'mock_jwt_token_' + Date.now());
      snackbar.success(`Account created successfully for ${companyName}!`);
      setIsLoading(false);

      if (typeof window !== 'undefined') {
        window.location.href = '/admin/dashboard/overview';
      }
    }, 800);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col lg:flex-row selection:bg-accent selection:text-accent-foreground">
      {/* Left Column: Project Branding & Registration Feature Showcase (Fixed) */}
      <div className="lg:w-1/2 h-full bg-gradient-to-br from-accent/25 via-background to-accent/10 border-b lg:border-b-0 lg:border-r border-border p-6 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Header Logo */}
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

        {/* Feature Showcase */}
        <div className="relative z-10 my-6 lg:my-0 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30">
            <Zap className="h-3.5 w-3.5" />
            <span>Admin Registration & Setup</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Empower Your HR Team with Complete Control
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Register your organization account to unlock employee directory management, automatic Login ID calculation, shift tracking, and salary slip generation.
          </p>

          <div className="space-y-2.5 pt-1 hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Full Administrative Oversight</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Approve leave requests, manage departments, and define custom role permissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Automated Credentials & Formatting</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Generate unique Login IDs (<code className="font-mono text-accent font-semibold">OIJODO20260001</code>) & initial passwords automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Dynamic Salary Engine</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Real-time wage computation, PF rate configuration, and professional tax deductions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            <span>Organization Setup</span>
          </div>
          <span className="text-[11px]">Dayflow Platform</span>
        </div>
      </div>

      {/* Right Column: Registration Form Section (Scrollable inside form side only) */}
      <div className="lg:w-1/2 h-full overflow-y-auto p-6 sm:p-10 lg:p-12 flex flex-col justify-start lg:justify-center items-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Register Organization Account</h2>
            <p className="text-xs text-muted-foreground">Fill in your company details to set up the HR portal</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Company Name & Upload Logo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Company Name</Label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g. Odoo India Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9 h-10 text-xs bg-muted/20"
                      required
                    />
                  </div>

                  <label
                    htmlFor="logo-upload-signup"
                    className="relative cursor-pointer shrink-0 transition-transform hover:scale-105"
                    title={logoUrl ? "Click to change company logo" : "Upload company logo"}
                  >
                    {logoUrl ? (
                      <div className="relative h-10 w-10 rounded-full border-2 border-accent bg-accent/15 overflow-hidden shadow-md flex items-center justify-center group/logo">
                        <img src={logoUrl} alt="Company Logo" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold uppercase tracking-wider">
                          Edit
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 px-3 rounded-lg border border-accent/40 bg-accent/15 text-accent text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-accent/25 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">{isUploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="logo-upload-signup"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                {logoUrl && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-0.5">
                    <Check className="h-3 w-3" /> Logo attached. Click circle to change.
                  </p>
                )}
              </div>

              {/* Admin Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-10 text-xs bg-muted/20"
                    required
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Corporate Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="sarah.jenkins@odoo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 text-xs bg-muted/20"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 h-10 text-xs bg-muted/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
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
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            {/* Already have an account */}
            <div className="pt-3 border-t border-border/60 text-center text-xs">
              <p className="text-muted-foreground">
                Already have an account?{' '}
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
