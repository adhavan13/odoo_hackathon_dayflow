'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useEmployeeStore, Employee } from '@/store';
import { snackbar } from '@/utils/snackbar';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Users,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';

export default function OrganizationSettingsPage() {
  const { employees, updateEmployee } = useEmployeeStore();

  // Role Management State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingRoles, setEditingRoles] = useState<Record<string, 'admin' | 'employee'>>({});

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

  const adminCount = employees.filter((e) => e.role === 'admin').length;
  const employeeCount = employees.filter((e) => e.role === 'employee').length;

  return (
    <PageContainer
      title="Organization Employee Directory & Roles"
      subtitle="Inspect workforce employee profiles, login credentials, and assign system access permissions"
      badge="Admin Only"
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Workforce</p>
              <p className="text-xl font-black text-foreground">{employees.length} Members</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Admin / HR Officers</p>
              <p className="text-xl font-black text-foreground">{adminCount} Admins</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-card shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Employees</p>
              <p className="text-xl font-black text-foreground">{employeeCount} Employees</p>
            </div>
          </div>
        </div>

        {/* EMPLOYEE ROLES & ACCESS MANAGEMENT TABLE */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold border border-indigo-500/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Employee System Roles & Access Permissions</h2>
                <p className="text-xs text-muted-foreground">
                  View employee details, login IDs, job titles, and update system role assignments
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

          {/* Employee Details Table */}
          <div className="rounded-2xl border border-border/80 overflow-hidden text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Employee Details</th>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Designation & Department</th>
                  <th className="p-4">Assigned System Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      No employee records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
