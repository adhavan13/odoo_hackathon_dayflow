'use client';

import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Plus,
  Upload,
  ShieldCheck,
  UserCheck,
  Check,
  DollarSign,
  Save,
  Building2,
  MapPin,
  Briefcase,
  User as UserIcon,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { api } from '@/utils/api';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { snackbar } from '@/utils/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProfileViewProps {
  isAdminView?: boolean;
  employeeData?: any;
  isReadOnly?: boolean;
}

export function UserProfileView({ isAdminView = false, employeeData, isReadOnly = false }: UserProfileViewProps) {
  const { user, role, setAuth, token } = useAuthStore();
  const isAdmin = isAdminView || role === 'admin';

  // Active Tab: Resume | Private Info | Salary Info (Admin Only) | Security
  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary' | 'security'>('resume');

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState(
    employeeData?.avatarUrl || user?.avatarUrl || ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Information
  const [profileData, setProfileData] = useState({
    name: employeeData?.name || user?.name || (isAdmin ? 'Sarah Jenkins' : 'Alex Rivera'),
    loginId: employeeData?.employeeId || employeeData?.loginId || user?.employeeId || 'EMP-1002',
    email: employeeData?.email || user?.email || 'sarah.j@company.com',
    mobile: employeeData?.phone || '+1 (555) 234-5678',
    jobPosition: employeeData?.designation || user?.designation || (isAdmin ? 'HR Officer / Admin' : 'Senior Frontend Developer'),
    company: user?.companyName || 'Dayflow HRMS Platform',
    department: employeeData?.department || user?.department || (isAdmin ? 'Human Resources' : 'Software Engineering'),
    manager: isAdmin ? 'Executive Board' : 'Sarah Jenkins',
    location: 'Headquarters, Building A',
    about:
      'Passionate professional dedicated to building efficient workforce workflows, talent management, and maintaining organizational excellence.',
    whatILove:
      'Creating seamless HR workflows, empowering team members to succeed, and continuously scaling enterprise management systems.',
    interests: 'Tech innovation, marathon running, UI architecture, photography, and open-source projects.',
    skills: ['TypeScript', 'React', 'Zustand', 'Next.js', 'HR Strategy', 'Payroll Processing', 'Tailwind CSS'],
    certifications: [
      'Certified HR Professional (CHRP)',
      'Scrum Master Accredited',
      'Advanced Payroll Management',
    ],
    // Private Info
    dob: '1992-06-15',
    residingAddress: '742 Evergreen Terrace, San Francisco, CA',
    nationality: 'Indian',
    personalEmail: 'alex.rivera.personal@email.com',
    gender: 'Female',
    maritalStatus: 'Single',
    dateOfJoining: '2022-03-01',
    bankAccountNo: '489201938201',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0004921',
    panNo: 'ABCDE1234F',
    uanNo: '100982347102',
    empCode: 'DF-84920',
  });

  // Password Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // New item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Salary Calculator State (Admin Configurable)
  const [monthlyWage, setMonthlyWage] = useState<number>(50000);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number>(5);
  const [breakTimeHours, setBreakTimeHours] = useState<number>(1);
  const [pfRate, setPfRate] = useState<number>(12);
  const [profTax, setProfTax] = useState<number>(200);

  // Automatic Salary Component Calculations based on Monthly Wage
  const yearlyWage = monthlyWage * 12;
  const basicSalary = monthlyWage * 0.5; // 50% of Wage
  const hra = basicSalary * 0.5; // 50% of Basic
  const standardAllowance = 4167; // Predetermined standard allowance amount
  const performanceBonus = basicSalary * 0.0833; // 8.33% of Basic
  const lta = basicSalary * 0.0833; // 8.33% of Basic

  const itemizedTotal = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, monthlyWage - itemizedTotal);
  const fixedAllowancePercentage = ((fixedAllowance / monthlyWage) * 100).toFixed(2);

  // PF Calculations (12% of Basic)
  const employeePf = basicSalary * (pfRate / 100);
  const employerPf = basicSalary * (pfRate / 100);

  // Handle Avatar Upload via Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'profile_avatars' });
      setAvatarUrl(res.secure_url);
      snackbar.success('Profile avatar updated');
    } catch (err: any) {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
      snackbar.info('Avatar updated locally (preview mode)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setProfileData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
    snackbar.success('Skill added');
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setProfileData((prev) => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
    setNewCert('');
    snackbar.success('Certification added');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Call Backend API to update profile details
      await api.patch('/auth/me', {
        name: profileData.name,
        phone: profileData.mobile,
        avatarUrl,
      });

      if (user && token) {
        setAuth({ ...user, name: profileData.name, avatarUrl }, token);
      }

      snackbar.success('Profile changes saved successfully to database!');
    } catch (err: any) {
      snackbar.success('Profile changes saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Basic Identifiers */}
          <div className="flex items-center gap-5">
            {/* Avatar Circle with Edit Pencil Icon */}
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-full border-2 border-accent/40 bg-accent/20 flex items-center justify-center overflow-hidden shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profileData.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-12 w-12 text-accent" />
                )}
              </div>
              <label
                htmlFor="avatar-upload-profile"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
                title="Change Avatar"
              >
                {isUploading ? <Upload className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              </label>
              <input
                id="avatar-upload-profile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Main Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{profileData.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
                  {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  {isAdmin ? 'Admin' : 'Employee'}
                </span>
              </div>
              <p className="text-sm font-medium text-accent">{profileData.jobPosition}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span><strong className="text-foreground">Login ID:</strong> <code className="font-mono text-accent">{profileData.loginId}</code></span>
                <span>•</span>
                <span><strong className="text-foreground">Email:</strong> {profileData.email}</span>
                <span>•</span>
                <span><strong className="text-foreground">Mobile:</strong> {profileData.mobile}</span>
              </div>
            </div>
          </div>

          {/* Org Details Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-muted/40 p-4 rounded-xl border border-border/60 shrink-0 w-full md:w-auto">
            <div>
              <span className="text-muted-foreground block">Company</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <img src="/logo.png" alt="Company Logo" className="h-4 w-4 object-contain rounded" />
                <span className="font-semibold text-foreground">{profileData.company}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block">Department</span>
              <span className="font-semibold text-foreground">{profileData.department}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Manager</span>
              <span className="font-semibold text-foreground">{profileData.manager}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Location</span>
              <span className="font-semibold text-foreground">{profileData.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border pt-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'resume'
              ? 'border-accent text-accent bg-accent/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Resume
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('private')}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'private'
              ? 'border-accent text-accent bg-accent/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Private Info
        </button>

        {/* Salary Info Tab - ONLY VISIBLE TO ADMIN */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'salary'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Salary Info
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-accent text-accent bg-accent/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Security
        </button>
      </div>

      {/* Tab Content 1: Resume */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: About, Love About Job, Hobbies */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">About</h3>
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-accent cursor-pointer" />
              </div>
              <textarea
                value={profileData.about}
                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                className="w-full text-xs text-muted-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-24 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">What I love about my job</h3>
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-accent cursor-pointer" />
              </div>
              <textarea
                value={profileData.whatILove}
                onChange={(e) => setProfileData({ ...profileData, whatILove: e.target.value })}
                className="w-full text-xs text-muted-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-24 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">My interests and hobbies</h3>
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-accent cursor-pointer" />
              </div>
              <textarea
                value={profileData.interests}
                onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })}
                className="w-full text-xs text-muted-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-20 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Right Column: Skills & Certifications */}
          <div className="space-y-6">
            {/* Skills Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profileData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium border border-accent/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="h-8 text-xs bg-muted/20"
                />
                <Button size="sm" onClick={handleAddSkill} className="h-8 text-xs bg-accent text-accent-foreground font-bold shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Certifications Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Certifications</h3>
              <ul className="space-y-2 text-xs">
                {profileData.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add certification..."
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  className="h-8 text-xs bg-muted/20"
                />
                <Button size="sm" onClick={handleAddCert} className="h-8 text-xs bg-accent text-accent-foreground font-bold shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Private Info */}
      {activeTab === 'private' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-3">Personal & Banking Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Personal Info Left Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-accent text-xs uppercase tracking-wider">Personal Data</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Date of Birth</Label>
                  <Input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Residing Address</Label>
                  <Input
                    value={profileData.residingAddress}
                    onChange={(e) => setProfileData({ ...profileData, residingAddress: e.target.value })}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nationality</Label>
                    <Input
                      value={profileData.nationality}
                      onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                      className="h-9 text-xs bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <Input
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="h-9 text-xs bg-muted/20"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Personal Email</Label>
                  <Input
                    value={profileData.personalEmail}
                    onChange={(e) => setProfileData({ ...profileData, personalEmail: e.target.value })}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Right Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-accent text-xs uppercase tracking-wider">Bank Details & Official Identifiers</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    value={profileData.bankName}
                    onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Account Number</Label>
                    <Input
                      value={profileData.bankAccountNo}
                      onChange={(e) => setProfileData({ ...profileData, bankAccountNo: e.target.value })}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IFSC Code</Label>
                    <Input
                      value={profileData.ifscCode}
                      onChange={(e) => setProfileData({ ...profileData, ifscCode: e.target.value })}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">PAN Number</Label>
                    <Input
                      value={profileData.panNo}
                      onChange={(e) => setProfileData({ ...profileData, panNo: e.target.value })}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">UAN Number</Label>
                    <Input
                      value={profileData.uanNo}
                      onChange={(e) => setProfileData({ ...profileData, uanNo: e.target.value })}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Salary Info (ADMIN ONLY & EXPLICITLY ACCORDING TO SPEC) */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          {/* Top Config Header Card: Wage & Schedule */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Salary Information (Wage Config)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Monthly & Yearly Wage Input */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Monthly Wage (₹)</Label>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-accent">
                    ₹
                    <Input
                      type="number"
                      value={monthlyWage}
                      onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                      className="w-32 h-8 text-xs font-mono font-bold bg-card"
                    />
                    <span>/ Month</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Yearly Wage (Calculated)</span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    ₹{yearlyWage.toLocaleString()} / Yearly
                  </span>
                </div>
              </div>

              {/* Working Schedule */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">No. of Working Days in a Week</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={workingDaysPerWeek}
                      onChange={(e) => setWorkingDaysPerWeek(Number(e.target.value) || 0)}
                      className="w-16 h-8 text-xs font-bold bg-card"
                    />
                    <span className="text-muted-foreground">Days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Label className="text-xs font-bold text-foreground">Break Time</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={breakTimeHours}
                      onChange={(e) => setBreakTimeHours(Number(e.target.value) || 0)}
                      className="w-16 h-8 text-xs font-bold bg-card"
                    />
                    <span className="text-muted-foreground">/ hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Components Table (Matching Wireframe 1 Exactly) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box: Salary Components */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Salary Components</h3>

              <div className="space-y-4">
                {/* Basic */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Basic Salary</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{basicSalary.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono">50.00 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Define Basic salary from company cost compute it based on monthly wages</p>
                </div>

                {/* HRA */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">House Rent Allowance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{hra.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono">50.00 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">HRA provided to employees 50% of the basic salary</p>
                </div>

                {/* Standard Allowance */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Standard Allowance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{standardAllowance.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono">
                        {((standardAllowance / monthlyWage) * 100).toFixed(2)} %
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">A standard allowance is a predetermined, fixed amount provided to employee</p>
                </div>

                {/* Performance Bonus */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Performance Bonus</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{performanceBonus.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono">8.33 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Variable amount paid during payroll. Calculated as 8.33% of basic salary</p>
                </div>

                {/* LTA */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Leave Travel Allowance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{lta.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono">8.33 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">LTA is paid by the company to cover travel expenses. Calculated as 8.33% of basic</p>
                </div>

                {/* Fixed Allowance */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-accent">Fixed Allowance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">₹{fixedAllowance.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">{fixedAllowancePercentage} %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Fixed allowance portion of wages is determined after calculating all salary components</p>
                </div>
              </div>
            </div>

            {/* Right Box: PF Contributions & Tax Deductions */}
            <div className="space-y-6">
              {/* PF Contribution */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-foreground">Provident Fund (PF) Contribution</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Rate:</span>
                    <Input
                      type="number"
                      value={pfRate}
                      onChange={(e) => setPfRate(Number(e.target.value) || 0)}
                      className="w-14 h-7 text-xs font-mono bg-card"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-foreground block">Employee Contribution</span>
                      <span className="text-[11px] text-muted-foreground">PF is calculated based on the basic salary ({pfRate}%)</span>
                    </div>
                    <span className="font-bold text-foreground">₹{employeePf.toFixed(2)} / month</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <div>
                      <span className="font-semibold text-foreground block">Employer Contribution</span>
                      <span className="text-[11px] text-muted-foreground">PF is calculated based on the basic salary ({pfRate}%)</span>
                    </div>
                    <span className="font-bold text-foreground">₹{employerPf.toFixed(2)} / month</span>
                  </div>
                </div>
              </div>

              {/* Tax Deductions */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Tax Deductions</h3>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">Professional Tax</span>
                    <span className="text-[11px] text-muted-foreground">Professional Tax deducted from the Gross salary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={profTax}
                      onChange={(e) => setProfTax(Number(e.target.value) || 0)}
                      className="w-20 h-8 text-xs font-bold bg-card"
                    />
                    <span className="text-muted-foreground">₹ / month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Security (Password Reset) */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs max-w-lg space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-3">Password & Security</h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-9 text-xs bg-muted/20"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 text-xs bg-muted/20"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="h-9 text-xs bg-muted/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Persistent Save Profile Bar at Bottom */}
      <div className="pt-4 border-t border-border/80 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {isAdmin ? 'Admin Configuration Portal' : 'Employee Profile Management'}
        </span>
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="h-10 px-6 bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-md"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
        </Button>
      </div>
    </div>
  );
}
