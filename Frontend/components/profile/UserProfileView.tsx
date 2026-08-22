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
  X,
  Lock,
  Trash2,
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Profile Information State initialized from props/auth store (no hardcoded fake values)
  const [profileData, setProfileData] = useState({
    name: employeeData?.name || user?.name || '',
    loginId: employeeData?.employeeId || employeeData?.loginId || user?.employeeId || '',
    email: employeeData?.email || user?.email || '',
    mobile: employeeData?.phone || employeeData?.mobile || user?.phone || user?.mobile || '',
    jobPosition: employeeData?.designation || user?.designation || '',
    company: user?.companyName || 'Dayflow HRMS Platform',
    department: employeeData?.department || user?.department || '',
    manager: employeeData?.manager || user?.manager || '',
    location: employeeData?.location || user?.location || '',
    about: employeeData?.about || user?.about || '',
    whatILove: employeeData?.whatILove || user?.whatILove || '',
    interests: employeeData?.interests || user?.interests || '',
    skills: (employeeData?.skills || user?.skills || []) as string[],
    certifications: (employeeData?.certifications || user?.certifications || []) as string[],
    // Private & Banking Info
    dob: employeeData?.dob || user?.dob || '',
    residingAddress: employeeData?.residingAddress || user?.residingAddress || user?.address || '',
    nationality: employeeData?.nationality || user?.nationality || '',
    personalEmail: employeeData?.personalEmail || user?.personalEmail || '',
    gender: employeeData?.gender || user?.gender || '',
    maritalStatus: employeeData?.maritalStatus || user?.maritalStatus || '',
    dateOfJoining: employeeData?.dateOfJoining || user?.dateOfJoining || user?.joinDate || '',
    bankAccountNo: employeeData?.bankAccountNo || user?.bankAccountNo || user?.bankDetails?.accountNumber || '',
    bankName: employeeData?.bankName || user?.bankName || user?.bankDetails?.bankName || '',
    ifscCode: employeeData?.ifscCode || user?.ifscCode || user?.bankDetails?.ifscCode || '',
    panNo: employeeData?.panNo || user?.panNo || user?.bankDetails?.panNo || '',
    uanNo: employeeData?.uanNo || user?.uanNo || user?.bankDetails?.uanNo || '',
    empCode: employeeData?.empCode || user?.empCode || user?.employeeId || '',
  });

  // Fetch latest profile from MongoDB on component load
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (employeeData) return; // If employeeData was passed directly as a prop
      setIsLoadingProfile(true);
      try {
        const response = await api.get('/auth/me');
        const me = response.data?.user || response.data;
        if (me) {
          setAvatarUrl(me.avatarUrl || me.logo || '');
          setProfileData((prev) => ({
            ...prev,
            name: me.name || prev.name,
            loginId: me.employeeId || prev.loginId,
            email: me.email || prev.email,
            mobile: me.phone || me.mobile || prev.mobile,
            jobPosition: me.designation || prev.jobPosition,
            company: me.companyName || prev.company,
            department: me.department || prev.department,
            manager: me.manager || prev.manager,
            location: me.location || prev.location,
            about: me.about || prev.about,
            whatILove: me.whatILove || prev.whatILove,
            interests: me.interests || prev.interests,
            skills: Array.isArray(me.skills) ? me.skills : prev.skills,
            certifications: Array.isArray(me.certifications) ? me.certifications : prev.certifications,
            dob: me.dob || prev.dob,
            residingAddress: me.residingAddress || me.address || prev.residingAddress,
            nationality: me.nationality || prev.nationality,
            personalEmail: me.personalEmail || prev.personalEmail,
            gender: me.gender || prev.gender,
            maritalStatus: me.maritalStatus || prev.maritalStatus,
            dateOfJoining: me.dateOfJoining || me.joinDate || prev.dateOfJoining,
            bankAccountNo: me.bankAccountNo || prev.bankAccountNo,
            bankName: me.bankName || prev.bankName,
            ifscCode: me.ifscCode || prev.ifscCode,
            panNo: me.panNo || prev.panNo,
            uanNo: me.uanNo || prev.uanNo,
            empCode: me.empCode || me.employeeId || prev.empCode,
          }));

          if (typeof me.monthlyWage !== 'undefined' && me.monthlyWage !== null) setMonthlyWage(me.monthlyWage);
          if (typeof me.workingDaysPerWeek !== 'undefined' && me.workingDaysPerWeek !== null) setWorkingDaysPerWeek(me.workingDaysPerWeek);
          if (typeof me.breakTimeHours !== 'undefined' && me.breakTimeHours !== null) setBreakTimeHours(me.breakTimeHours);
          if (typeof me.pfRate !== 'undefined' && me.pfRate !== null) setPfRate(me.pfRate);
          if (typeof me.profTax !== 'undefined' && me.profTax !== null) setProfTax(me.profTax);
        }
      } catch (err) {
        // Silently fallback to current store state
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchLatestProfile();
  }, [employeeData]);

  // Password Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // New item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Salary Calculator State (Admin Configurable - default empty/unconfigured)
  const [monthlyWage, setMonthlyWage] = useState<number | ''>(
    employeeData?.monthlyWage ?? user?.monthlyWage ?? ''
  );
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number | ''>(
    employeeData?.workingDaysPerWeek ?? user?.workingDaysPerWeek ?? ''
  );
  const [breakTimeHours, setBreakTimeHours] = useState<number | ''>(
    employeeData?.breakTimeHours ?? user?.breakTimeHours ?? ''
  );
  const [pfRate, setPfRate] = useState<number | ''>(
    employeeData?.pfRate ?? user?.pfRate ?? ''
  );
  const [profTax, setProfTax] = useState<number | ''>(
    employeeData?.profTax ?? user?.profTax ?? ''
  );

  // Parse numerical values safely
  const numWage = typeof monthlyWage === 'number' ? monthlyWage : Number(monthlyWage) || 0;
  const numWorkingDays = typeof workingDaysPerWeek === 'number' ? workingDaysPerWeek : Number(workingDaysPerWeek) || 0;
  const numBreakHours = typeof breakTimeHours === 'number' ? breakTimeHours : Number(breakTimeHours) || 0;
  const numPfRate = typeof pfRate === 'number' ? pfRate : Number(pfRate) || 0;
  const numProfTax = typeof profTax === 'number' ? profTax : Number(profTax) || 0;

  // Automatic Salary Component Calculations based on Monthly Wage
  const yearlyWage = numWage * 12;
  const basicSalary = numWage * 0.5; // 50% of Wage
  const hra = basicSalary * 0.5; // 50% of Basic
  const standardAllowance = numWage > 0 ? 4167 : 0;
  const performanceBonus = basicSalary * 0.0833;
  const lta = basicSalary * 0.0833;

  const itemizedTotal = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, numWage - itemizedTotal);
  const fixedAllowancePercentage = numWage > 0 ? ((fixedAllowance / numWage) * 100).toFixed(2) : '0.00';

  // PF Calculations
  const employeePf = basicSalary * (numPfRate / 100);
  const employerPf = basicSalary * (numPfRate / 100);

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

  // Delete / Remove Avatar
  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    try {
      await api.patch('/auth/me', { avatarUrl: '' });
      if (user && token) {
        setAuth({ ...user, avatarUrl: '' }, token);
      }
      snackbar.success('Profile picture deleted. Reverted to default avatar.');
    } catch (err) {
      snackbar.info('Profile picture removed');
    }
  };

  // Add & Remove Skills
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setProfileData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
    snackbar.success('Skill added');
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
    snackbar.info('Skill removed');
  };

  // Add & Remove Certifications
  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setProfileData((prev) => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
    setNewCert('');
    snackbar.success('Certification added');
  };

  const handleRemoveCert = (indexToRemove: number) => {
    setProfileData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== indexToRemove),
    }));
    snackbar.info('Certification removed');
  };

  // Save all profile details to MongoDB backend
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: profileData.name,
        phone: profileData.mobile,
        mobile: profileData.mobile,
        avatarUrl,
        designation: profileData.jobPosition,
        department: profileData.department,
        manager: profileData.manager,
        location: profileData.location,
        about: profileData.about,
        whatILove: profileData.whatILove,
        interests: profileData.interests,
        skills: profileData.skills,
        certifications: profileData.certifications,
        dob: profileData.dob,
        residingAddress: profileData.residingAddress,
        nationality: profileData.nationality,
        gender: profileData.gender,
        personalEmail: profileData.personalEmail,
        bankName: profileData.bankName,
        bankAccountNo: profileData.bankAccountNo,
        ifscCode: profileData.ifscCode,
        panNo: profileData.panNo,
        uanNo: profileData.uanNo,
        monthlyWage: typeof monthlyWage === 'number' ? monthlyWage : Number(monthlyWage) || 0,
        workingDaysPerWeek: typeof workingDaysPerWeek === 'number' ? workingDaysPerWeek : Number(workingDaysPerWeek) || 0,
        breakTimeHours: typeof breakTimeHours === 'number' ? breakTimeHours : Number(breakTimeHours) || 0,
        pfRate: typeof pfRate === 'number' ? pfRate : Number(pfRate) || 0,
        profTax: typeof profTax === 'number' ? profTax : Number(profTax) || 0,
      };

      const response = await api.patch('/auth/me', payload);
      const updatedUser = response.data?.user || response.data;

      if (user && token) {
        setAuth({
          ...user,
          ...payload,
          ...(updatedUser || {}),
        }, token);
      }

      snackbar.success('Profile changes saved successfully to MongoDB!');
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || err?.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar and Basic Identifiers */}
          <div className="flex items-center gap-5">
            {/* Avatar Circle with Edit Pencil Icon */}
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-full border-2 border-accent/40 bg-accent/20 flex items-center justify-center overflow-hidden shadow-md">
                <img src={avatarUrl || '/user.png'} alt={profileData.name || 'User'} className="h-full w-full object-cover" />
              </div>
              {!isReadOnly && (
                <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                  <label
                    htmlFor="avatar-upload-profile"
                    className="h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
                    title="Upload / Change Avatar"
                  >
                    {isUploading ? <Upload className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                  </label>
                  {avatarUrl && avatarUrl !== '/user.png' && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
                      title="Delete Profile Picture"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <input
                    id="avatar-upload-profile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              )}
            </div>

            {/* Main Info Fields */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isReadOnly ? (
                  <h1 className="text-2xl font-bold text-foreground">{profileData.name || 'Employee Name'}</h1>
                ) : (
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter Full Name (e.g. THAYANITHI S)"
                    className="text-lg font-bold text-foreground h-9 max-w-xs bg-muted/20"
                  />
                )}
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
                  {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  {isAdmin ? 'Admin' : 'Employee'}
                </span>
              </div>

              {isReadOnly ? (
                <p className="text-sm font-medium text-accent">{profileData.jobPosition || 'Job Title'}</p>
              ) : (
                <Input
                  value={profileData.jobPosition}
                  onChange={(e) => setProfileData({ ...profileData, jobPosition: e.target.value })}
                  placeholder="Designation / Position (e.g. Senior Developer)"
                  className="text-xs font-semibold text-accent h-8 max-w-xs bg-muted/20"
                />
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1 items-center">
                <span>
                  <strong className="text-foreground">Login ID:</strong>{' '}
                  <code className="font-mono text-accent">{profileData.loginId || 'EMP-8215'}</code>
                </span>
                <span>•</span>
                <span>
                  <strong className="text-foreground">Email:</strong> {profileData.email || user?.email || 'N/A'}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <strong className="text-foreground">Mobile:</strong>
                  {isReadOnly ? (
                    <span>{profileData.mobile || 'Not set'}</span>
                  ) : (
                    <Input
                      value={profileData.mobile}
                      onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      className="h-7 text-xs w-40 bg-muted/20"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isReadOnly && (
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold uppercase tracking-wider gap-2 shadow-md shrink-0 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          )}
        </div>

        {/* Org Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-muted/30 p-4 rounded-xl border border-border/60">
          <div>
            <span className="text-muted-foreground block font-medium">Company</span>
            <div className="flex items-center gap-1.5 mt-1">
              <img src="/logo.png" alt="Company Logo" className="h-4 w-4 object-contain rounded" />
              <span className="font-semibold text-foreground">{profileData.company || 'Dayflow HRMS Platform'}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Department</span>
            {isReadOnly ? (
              <span className="font-semibold text-foreground">{profileData.department || 'Not specified'}</span>
            ) : (
              <Input
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                placeholder="e.g. Software Engineering"
                className="h-7 text-xs mt-1 bg-card"
              />
            )}
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Manager</span>
            {isReadOnly ? (
              <span className="font-semibold text-foreground">{profileData.manager || 'Not specified'}</span>
            ) : (
              <Input
                value={profileData.manager}
                onChange={(e) => setProfileData({ ...profileData, manager: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="h-7 text-xs mt-1 bg-card"
              />
            )}
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Location</span>
            {isReadOnly ? (
              <span className="font-semibold text-foreground">{profileData.location || 'Not specified'}</span>
            ) : (
              <Input
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="e.g. Headquarters, Building A"
                className="h-7 text-xs mt-1 bg-card"
              />
            )}
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
              </div>
              <textarea
                value={profileData.about}
                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                placeholder="Write a brief bio about your role, background, and work philosophy..."
                disabled={isReadOnly}
                className="w-full text-xs text-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-24 focus:outline-none focus:border-accent disabled:opacity-80"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">What I love about my job</h3>
              </div>
              <textarea
                value={profileData.whatILove}
                onChange={(e) => setProfileData({ ...profileData, whatILove: e.target.value })}
                placeholder="Share what inspires you and drives your passion at work..."
                disabled={isReadOnly}
                className="w-full text-xs text-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-24 focus:outline-none focus:border-accent disabled:opacity-80"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">My interests and hobbies</h3>
              </div>
              <textarea
                value={profileData.interests}
                onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })}
                placeholder="List your personal hobbies, interests, and activities outside of work..."
                disabled={isReadOnly}
                className="w-full text-xs text-foreground bg-muted/20 border border-border/60 rounded-lg p-3 resize-none h-20 focus:outline-none focus:border-accent disabled:opacity-80"
              />
            </div>
          </div>

          {/* Right Column: Skills & Certifications */}
          <div className="space-y-6">
            {/* Skills Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                {profileData.skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                ) : (
                  profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium border border-accent/20"
                    >
                      <span>{skill}</span>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="hover:text-destructive text-accent/60 transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
              {!isReadOnly && (
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="h-8 text-xs bg-muted/20"
                  />
                  <Button size="sm" onClick={handleAddSkill} className="h-8 text-xs bg-accent text-accent-foreground font-bold shrink-0">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              )}
            </div>

            {/* Certifications Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Certifications</h3>
              <ul className="space-y-2 text-xs">
                {profileData.certifications.length === 0 ? (
                  <li className="text-xs text-muted-foreground italic">No certifications added yet.</li>
                ) : (
                  profileData.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 text-foreground font-medium bg-muted/20 p-2.5 rounded-lg border border-border/40">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{cert}</span>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Remove certification"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
              {!isReadOnly && (
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add certification..."
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCert();
                      }
                    }}
                    className="h-8 text-xs bg-muted/20"
                  />
                  <Button size="sm" onClick={handleAddCert} className="h-8 text-xs bg-accent text-accent-foreground font-bold shrink-0">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              )}
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
                    disabled={isReadOnly}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Residing Address</Label>
                  <Input
                    value={profileData.residingAddress}
                    onChange={(e) => setProfileData({ ...profileData, residingAddress: e.target.value })}
                    placeholder="e.g. 742 Evergreen Terrace, San Francisco, CA"
                    disabled={isReadOnly}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nationality</Label>
                    <Input
                      value={profileData.nationality}
                      onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                      placeholder="e.g. Indian"
                      disabled={isReadOnly}
                      className="h-9 text-xs bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <Input
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      placeholder="e.g. Female / Male"
                      disabled={isReadOnly}
                      className="h-9 text-xs bg-muted/20"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Personal Email</Label>
                  <Input
                    type="email"
                    value={profileData.personalEmail}
                    onChange={(e) => setProfileData({ ...profileData, personalEmail: e.target.value })}
                    placeholder="e.g. alex.rivera.personal@email.com"
                    disabled={isReadOnly}
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
                    placeholder="e.g. HDFC Bank"
                    disabled={isReadOnly}
                    className="h-9 text-xs bg-muted/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Account Number</Label>
                    <Input
                      value={profileData.bankAccountNo}
                      onChange={(e) => setProfileData({ ...profileData, bankAccountNo: e.target.value })}
                      placeholder="e.g. 489201938201"
                      disabled={isReadOnly}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IFSC Code</Label>
                    <Input
                      value={profileData.ifscCode}
                      onChange={(e) => setProfileData({ ...profileData, ifscCode: e.target.value })}
                      placeholder="e.g. HDFC0004921"
                      disabled={isReadOnly}
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
                      placeholder="e.g. ABCDE1234F"
                      disabled={isReadOnly}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">UAN Number</Label>
                    <Input
                      value={profileData.uanNo}
                      onChange={(e) => setProfileData({ ...profileData, uanNo: e.target.value })}
                      placeholder="e.g. 100982347102"
                      disabled={isReadOnly}
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
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">Salary Information (Wage Config)</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">Wage Type:</span>
                <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30">
                  Fixed Wage
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Monthly & Yearly Wage Input */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Monthly Wage (Defined Wage)</Label>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-accent">
                    ₹
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={monthlyWage}
                      onChange={(e) => setMonthlyWage(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="5"
                      value={workingDaysPerWeek}
                      onChange={(e) => setWorkingDaysPerWeek(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="1"
                      value={breakTimeHours}
                      onChange={(e) => setBreakTimeHours(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-16 h-8 text-xs font-bold bg-card"
                    />
                    <span className="text-muted-foreground">/ hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Computation Summary Banner */}
            {numWage > 0 && (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-xs flex items-center justify-between flex-wrap gap-2">
                <span className="font-medium text-foreground">
                  <strong>Automatic Calculation Summary:</strong> If Defined Wage = ₹{numWage.toLocaleString()}, Basic (50%) = <strong className="text-accent">₹{basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>, HRA (50% of Basic) = <strong className="text-accent">₹{hra.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-[11px] font-semibold text-accent bg-card px-2 py-0.5 rounded border border-accent/20">
                  Total Components = Defined Wage
                </span>
              </div>
            )}
          </div>

          {/* Salary Components Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box: Salary Components */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-foreground">Salary Structure Components</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Computation Type</span>
              </div>

              <div className="space-y-4">
                {/* Basic */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Basic Salary</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">Percentage of Wage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{basicSalary.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-bold">50.00 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Calculated as 50% of defined monthly wage</p>
                </div>

                {/* HRA */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">House Rent Allowance (HRA)</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">Percentage of Basic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{hra.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-bold">50.00 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">HRA provided as 50% of Basic salary (25% of Defined Wage)</p>
                </div>

                {/* Standard Allowance */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Standard Allowance</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">Fixed Amount</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{standardAllowance.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-bold">
                        {numWage > 0 ? ((standardAllowance / numWage) * 100).toFixed(2) : '0.00'} %
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Predetermined fixed amount provided to employee (₹4,167.00 / month)</p>
                </div>

                {/* Performance Bonus */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Performance Bonus</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">Percentage of Basic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{performanceBonus.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-bold">8.33 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Variable incentive calculated as 8.33% of Basic salary</p>
                </div>

                {/* LTA */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Leave Travel Allowance (LTA)</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">Percentage of Basic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{lta.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-bold">8.333 %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">LTA covered by company, calculated as 8.333% of Basic salary</p>
                </div>

                {/* Fixed Allowance */}
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-accent">Fixed Allowance</span>
                      <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-mono font-bold">Auto Balancer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">₹{fixedAllowance.toFixed(2)} / month</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono font-bold">{fixedAllowancePercentage} %</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Fixed allowance = Defined Wage - (Basic + HRA + Standard + Bonus + LTA)</p>
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
                      placeholder="12"
                      value={pfRate}
                      onChange={(e) => setPfRate(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-14 h-7 text-xs font-mono bg-card"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-foreground block">Employee Contribution</span>
                      <span className="text-[11px] text-muted-foreground">PF is calculated based on the basic salary ({numPfRate}%)</span>
                    </div>
                    <span className="font-bold text-foreground">₹{employeePf.toFixed(2)} / month</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <div>
                      <span className="font-semibold text-foreground block">Employer Contribution</span>
                      <span className="text-[11px] text-muted-foreground">PF is calculated based on the basic salary ({numPfRate}%)</span>
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
                      placeholder="200"
                      value={profTax}
                      onChange={(e) => setProfTax(e.target.value === '' ? '' : Number(e.target.value))}
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
      {!isReadOnly && (
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
      )}
    </div>
  );
}
