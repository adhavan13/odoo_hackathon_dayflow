'use client';

import React, { useState } from 'react';
import { Pencil, Plus, Upload, ShieldCheck, UserCheck, Check, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store';
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
  const { user, role } = useAuthStore();
  const isAdmin = isAdminView || role === 'admin';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary'>('resume');

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState(
    employeeData?.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  );
  const [isUploading, setIsUploading] = useState(false);

  // Profile Information
  const [profileData, setProfileData] = useState({
    name: employeeData?.name || user?.name || (isAdmin ? 'Sarah Jenkins' : 'Alex Rivera'),
    loginId: employeeData?.loginId || 'EMP-2026-084',
    email: employeeData?.email || user?.email || 'user@company.com',
    mobile: employeeData?.phone || '+1 (555) 234-5678',
    jobPosition: employeeData?.designation || user?.designation || (isAdmin ? 'HR Officer / Admin' : 'Senior Frontend Developer'),
    company: 'Dayflow Technologies Ltd',
    department: employeeData?.department || user?.department || (isAdmin ? 'Human Resources' : 'Software Engineering'),
    manager: isAdmin ? 'Executive Board' : 'Sarah Jenkins',
    location: 'Building A, Headquarters',
    about:
      'Passionate professional dedicated to building efficient, human-centric workforce solutions and maintaining organizational excellence.',
    whatILove:
      'Creating seamless workflows, empowering team members to succeed, and continuously learning new technologies and methods.',
    interests: 'Tech innovation, marathon running, UI architecture, photography, and open-source projects.',
    skills: ['TypeScript', 'React', 'Zustand', 'Next.js', 'HR Strategy', 'Payroll Processing', 'Tailwind CSS'],
    certifications: [
      'Certified HR Professional (CHRP)',
      'Scrum Master Accredited',
      'Advanced Cloud Architecture',
    ],
    // Private Info
    dob: '1992-06-15',
    residingAddress: '742 Evergreen Terrace, San Francisco, CA',
    nationality: 'American',
    personalEmail: 'alex.rivera.personal@email.com',
    gender: 'Male',
    maritalStatus: 'Single',
    dateOfJoining: '2022-03-01',
    bankAccountNo: '489201938201',
    bankName: 'Silicon Valley National Bank',
    ifscCode: 'SVNB0004921',
    panNo: 'ABCDE1234F',
    uanNo: '100982347102',
    empCode: 'DF-84920',
  });

  // New item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Salary Calculator State
  const [monthlyWage, setMonthlyWage] = useState<number>(50000);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number>(5);
  const [breakTimeHours, setBreakTimeHours] = useState<number>(1);
  const [pfRate, setPfRate] = useState<number>(12);
  const [profTax, setProfTax] = useState<number>(200);

  // Automatic Salary Calculations based on Monthly Wage
  const yearlyWage = monthlyWage * 12;
  const basicSalary = monthlyWage * 0.5; // 50% of Wage
  const hra = basicSalary * 0.5; // 50% of Basic
  const standardAllowance = 4167; // Predetermined standard allowance
  const performanceBonus = basicSalary * 0.0833; // 8.33% of Basic
  const lta = basicSalary * 0.0833; // 8.33% of Basic

  const itemizedTotal = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, monthlyWage - itemizedTotal);
  const fixedAllowancePercentage = ((fixedAllowance / monthlyWage) * 100).toFixed(2);

  // PF Calculations (12% of Basic)
  const employeePf = basicSalary * (pfRate / 100);
  const employerPf = basicSalary * (pfRate / 100);

  // Handle Avatar Change via Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'profile_avatars' });
      setAvatarUrl(res.secure_url);
      snackbar.success('Profile avatar updated successfully');
    } catch (err: any) {
      // Fallback to local URL preview if Cloudinary credentials are not configured
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Basic Identifiers */}
          <div className="flex items-center gap-5">
            {/* Avatar Circle with Edit Pencil */}
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-full border-2 border-accent/40 bg-muted overflow-hidden shadow-md">
                <img src={avatarUrl} alt={profileData.name} className="h-full w-full object-cover" />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
                title="Change Avatar"
              >
                {isUploading ? <Upload className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Main Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{profileData.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
                  {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  {isAdmin ? 'Admin' : 'Employee'}
                </span>
              </div>
              <p className="text-sm font-medium text-accent">{profileData.jobPosition}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span><strong className="text-foreground">Login ID:</strong> {profileData.loginId}</span>
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
              <span className="font-semibold text-foreground">{profileData.company}</span>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border mt-6 pt-2 overflow-x-auto">
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

          {/* Salary Info tab - ONLY VISIBLE TO ADMIN */}
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
        </div>
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
              <p className="text-xs text-muted-foreground leading-relaxed">{profileData.about}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">What I love about my job</h3>
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-accent cursor-pointer" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{profileData.whatILove}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">My interests and hobbies</h3>
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-accent cursor-pointer" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{profileData.interests}</p>
            </div>
          </div>

          {/* Right Column: Skills & Certifications */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-medium border border-accent/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Add new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={handleAddSkill} className="h-8 px-3 text-xs bg-accent text-accent-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Certifications</h3>
              <ul className="space-y-2">
                {profileData.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                    <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Add certification..."
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={handleAddCert} className="h-8 px-3 text-xs bg-accent text-accent-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Private Info */}
      {activeTab === 'private' && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Personal Information</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-semibold text-foreground">{profileData.dob}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Residing Address</span>
                  <span className="font-semibold text-foreground text-right">{profileData.residingAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Nationality</span>
                  <span className="font-semibold text-foreground">{profileData.nationality}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Personal Email</span>
                  <span className="font-semibold text-foreground">{profileData.personalEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-semibold text-foreground">{profileData.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Marital Status</span>
                  <span className="font-semibold text-foreground">{profileData.maritalStatus}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Date of Joining</span>
                  <span className="font-semibold text-foreground">{profileData.dateOfJoining}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Bank Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Bank Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-semibold text-foreground font-mono">{profileData.bankAccountNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span className="font-semibold text-foreground">{profileData.bankName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">IFSC Code</span>
                  <span className="font-semibold text-foreground font-mono">{profileData.ifscCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">PAN No</span>
                  <span className="font-semibold text-foreground font-mono">{profileData.panNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">UAN No</span>
                  <span className="font-semibold text-foreground font-mono">{profileData.uanNo}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Emp Code</span>
                  <span className="font-semibold text-foreground font-mono">{profileData.empCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Salary Info (ADMIN ONLY) */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          {/* Top Wage Input Banner */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Wage & Schedule Definition</h3>
              <span className="text-xs text-muted-foreground">Fixed wage structure</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label className="text-xs text-muted-foreground">Monthly Wage (₹)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="font-bold text-sm h-9"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">/ Month</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Yearly Wage (₹)</Label>
                <div className="mt-1.5 h-9 flex items-center px-3 rounded-md bg-muted/50 border border-border text-sm font-bold text-accent">
                  ₹{yearlyWage.toLocaleString('en-IN')} <span className="text-xs text-muted-foreground ml-1.5 font-normal">/ Yearly</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Working Days / Week</Label>
                <Input
                  type="number"
                  value={workingDaysPerWeek}
                  onChange={(e) => setWorkingDaysPerWeek(Number(e.target.value) || 0)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Break Time (Hours)</Label>
                <Input
                  type="number"
                  value={breakTimeHours}
                  onChange={(e) => setBreakTimeHours(Number(e.target.value) || 0)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Salary Components & Contributions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box: Salary Components */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
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
                    <span className="font-semibold text-foreground">House Rent Allowance (HRA)</span>
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
                  <p className="text-[11px] text-muted-foreground">Variable amount paid during payroll. Calculated as 8.33% of the basic salary</p>
                </div>

                {/* LTA */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Leave Travel Allowance (LTA)</span>
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
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-foreground">Provident Fund (PF) Contribution</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Rate:</span>
                    <Input
                      type="number"
                      value={pfRate}
                      onChange={(e) => setPfRate(Number(e.target.value) || 0)}
                      className="w-14 h-7 text-xs font-mono"
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
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
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
                      className="w-20 h-8 text-xs font-bold"
                    />
                    <span className="text-muted-foreground">₹ / month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
