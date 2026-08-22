'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useLeaveStore } from '@/store/useLeaveStore';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Lock,
  Search,
  CheckCircle2,
  Users,
  Edit2,
  Key,
  Palmtree,
  Stethoscope,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { Employee } from '@/store';

export default function OrganizationSettingsPage() {
  const { employees, updateEmployee } = useEmployeeStore();
  const { paidLeaveLimit, sickLeaveLimit, updateLeaveLimits } = useLeaveStore();

  const [tempPaidLimit, setTempPaidLimit] = useState(paidLeaveLimit);
  const [tempSickLimit, setTempSickLimit] = useState(sickLeaveLimit);

  // Organization Details Form State
  const [orgDetails, setOrgDetails] = useState({
    companyName: 'Dayflow HRMS India Pvt Ltd',
    registrationNumber: 'CIN: U72900MH2022PTC384910',
    corporateEmail: 'corporate@odoo-dayflow.com',
    supportPhone: '+91 (022) 4920-8800',
    address: 'Dayflow Tower, Tech Park Phase 2, Mumbai, MH 400076',
    currency: 'INR (₹)',
    workShiftStart: '09:00 AM',
    workShiftEnd: '06:00 PM',
    timezone: 'Asia/Kolkata (IST +05:30)',
  });

  const [savingOrg, setSavingOrg] = useState(false);

  // Role Management State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingRoles, setEditingRoles] = useState<Record<string, 'admin' | 'employee'>>({});

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    setTimeout(() => {
      setSavingOrg(false);
      snackbar.success('Organization & System settings updated successfully!');
    }, 600);
  };

  const handleRoleSelect = (empId: string, newRole: 'admin' | 'employee') => {
    setEditingRoles((prev) => ({ ...prev, [empId]: newRole }));
  };

  const handleSaveRole = async (emp: Employee) => {
    const targetRole = editingRoles[emp.id] || emp.role;
    try {
      await updateEmployee(emp.id, { role: targetRole });
      snackbar.success(`Updated system role for ${emp.name} to ${targetRole === 'admin' ? 'Admin / HR Officer' : 'Employee'}.`);
    } catch (err: any) {
      snackbar.error('Failed to update role.');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      (emp.loginId && emp.loginId.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <PageContainer
      title="Organization & System Settings"
      subtitle="Single consolidated admin panel for company profile, work policies, employee roles, and system permissions"
      badge="Admin Only"
    >
      <div className="space-y-8">
        {/* SECTION 1: ORGANIZATION DETAILS & PROFILE FORM */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold border border-accent/25">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">Organization Profile & Corporate Info</h2>
              <p className="text-xs text-muted-foreground">Manage official company details, corporate contact address, and shift defaults</p>
            </div>
          </div>

          <form onSubmit={handleOrgSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Company Legal Name</Label>
                <Input
                  value={orgDetails.companyName}
                  onChange={(e) => setOrgDetails({ ...orgDetails, companyName: e.target.value })}
                  className="h-10 text-xs bg-muted/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Registration / CIN Number</Label>
                <Input
                  value={orgDetails.registrationNumber}
                  onChange={(e) => setOrgDetails({ ...orgDetails, registrationNumber: e.target.value })}
                  className="h-10 text-xs bg-muted/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-accent" /> Corporate Email
                </Label>
                <Input
                  type="email"
                  value={orgDetails.corporateEmail}
                  onChange={(e) => setOrgDetails({ ...orgDetails, corporateEmail: e.target.value })}
                  className="h-10 text-xs bg-muted/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-accent" /> Support Phone
                </Label>
                <Input
                  value={orgDetails.supportPhone}
                  onChange={(e) => setOrgDetails({ ...orgDetails, supportPhone: e.target.value })}
                  className="h-10 text-xs bg-muted/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-accent" /> Base Payroll Currency
                </Label>
                <Input
                  value={orgDetails.currency}
                  onChange={(e) => setOrgDetails({ ...orgDetails, currency: e.target.value })}
                  className="h-10 text-xs bg-muted/20 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-accent" /> Corporate Address
              </Label>
              <Input
                value={orgDetails.address}
                onChange={(e) => setOrgDetails({ ...orgDetails, address: e.target.value })}
                className="h-10 text-xs bg-muted/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Default Shift Start
                </Label>
                <Input
                  value={orgDetails.workShiftStart}
                  onChange={(e) => setOrgDetails({ ...orgDetails, workShiftStart: e.target.value })}
                  className="h-10 text-xs bg-muted/20 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Default Shift End
                </Label>
                <Input
                  value={orgDetails.workShiftEnd}
                  onChange={(e) => setOrgDetails({ ...orgDetails, workShiftEnd: e.target.value })}
                  className="h-10 text-xs bg-muted/20 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Timezone</Label>
                <Input
                  value={orgDetails.timezone}
                  onChange={(e) => setOrgDetails({ ...orgDetails, timezone: e.target.value })}
                  className="h-10 text-xs bg-muted/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button
                type="submit"
                disabled={savingOrg}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-extrabold text-xs px-6 h-10 gap-2 cursor-pointer shadow-md"
              >
                <Save className="h-4 w-4" />
                {savingOrg ? 'Saving...' : 'Save Organization Profile'}
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 2: EMPLOYEE LEAVE QUOTA & POLICY LIMITS */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/25">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">Employee Annual Leave Quota & Policy Limits</h2>
              <p className="text-xs text-muted-foreground">Define annual limits for Paid Time Off and Sick Leaves allocated to all employees across the organization</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateLeaveLimits(Number(tempPaidLimit), Number(tempSickLimit));
              snackbar.success('Annual Paid & Sick Leave Limits updated successfully!');
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl border border-accent/30 bg-accent/5 space-y-3">
                <div className="flex items-center gap-2 text-accent font-extrabold text-sm">
                  <Palmtree className="h-4 w-4" />
                  Paid Time Off (PTO) Limit
                </div>
                <p className="text-xs text-muted-foreground">Annual number of paid leave days granted to each employee per year.</p>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Annual Paid Leaves (Days / Year)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={tempPaidLimit}
                    onChange={(e) => setTempPaidLimit(Number(e.target.value))}
                    className="h-10 text-xs font-bold font-mono bg-card"
                    required
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                  <Stethoscope className="h-4 w-4" />
                  Sick Leave Policy Limit
                </div>
                <p className="text-xs text-muted-foreground">Annual quota for medical / sick leave days available to each employee.</p>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Annual Sick Leaves (Days / Year)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={tempSickLimit}
                    onChange={(e) => setTempSickLimit(Number(e.target.value))}
                    className="h-10 text-xs font-bold font-mono bg-card"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-extrabold text-xs px-6 h-10 gap-2 cursor-pointer shadow-md"
              >
                <Save className="h-4 w-4" />
                Update Leave Limits & Policy
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 3: EMPLOYEE ROLES & ACCESS MANAGEMENT TABLE */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold border border-indigo-500/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Employee System Roles & Permissions</h2>
                <p className="text-xs text-muted-foreground">
                  Admin-only management to inspect workforce profiles and assign System Roles (Admin vs Employee)
                </p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search name, email, login ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-muted/20"
                />
              </div>

              <CustomSelect
                value={roleFilter}
                onValueChange={setRoleFilter}
                options={[
                  { label: 'All Roles', value: 'all' },
                  { label: 'Admin / HR Officer', value: 'admin' },
                  { label: 'Employee', value: 'employee' },
                ]}
                className="w-40 h-9 text-xs"
              />
            </div>
          </div>

          {/* Employee Roles Table */}
          <div className="rounded-2xl border border-border/80 overflow-hidden text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Designation & Department</th>
                  <th className="p-4">Assigned System Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEmployees.map((emp) => {
                  const currentSelectedRole = editingRoles[emp.id] || emp.role;
                  const isModified = currentSelectedRole !== emp.role;

                  return (
                    <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                      {/* User Profile */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-sm overflow-hidden shrink-0">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" />
                            ) : (
                              emp.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-xs">{emp.name}</p>
                            <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td className="p-4 font-mono font-bold text-accent">
                        {emp.loginId || emp.id}
                      </td>

                      {/* Designation */}
                      <td className="p-4">
                        <p className="font-bold text-foreground">{emp.designation}</p>
                        <p className="text-[11px] text-muted-foreground">{emp.department}</p>
                      </td>

                      {/* System Role Selector */}
                      <td className="p-4">
                        <CustomSelect
                          value={currentSelectedRole}
                          onValueChange={(val) => handleRoleSelect(emp.id, val as 'admin' | 'employee')}
                          options={[
                            { label: 'Employee', value: 'employee' },
                            { label: 'Admin / HR Officer', value: 'admin' },
                          ]}
                          className="w-48 h-9 text-xs"
                        />
                      </td>

                      {/* Save Role Action */}
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSaveRole(emp)}
                          className={`h-8 text-xs font-bold px-3 gap-1.5 cursor-pointer ${
                            isModified
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                              : 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isModified ? 'Save Role Change' : 'Update Role'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
