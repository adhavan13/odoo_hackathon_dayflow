'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useEmployeeStore, Employee } from '@/store';
import { generateLoginId, generateTemporaryPassword } from '@/utils/idGenerator';
import { snackbar } from '@/utils/snackbar';
import { Plus, Search, UserCheck, ShieldCheck, Copy, Check, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AllEmployeesPage() {
  const { employees, addEmployee } = useEmployeeStore();
  const [search, setSearch] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createdEmpInfo, setCreatedEmpInfo] = useState<Employee | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [designation, setDesignation] = useState('Frontend Engineer');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  // Real-time Preview Calculation
  const previewYear = new Date(joinDate || Date.now()).getFullYear();
  const previewSerial = employees.length + 1;
  const previewLoginId = generateLoginId(firstName, lastName, previewYear, previewSerial);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      snackbar.error('First Name, Last Name, and Email are required.');
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const newEmp = await addEmployee({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department,
        designation,
        role,
        status: 'Active',
        joinDate,
      });

      setCreatedEmpInfo(newEmp);
      setIsAddModalOpen(false);

      // Reset Form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      snackbar.error('Failed to create employee');
    }
  };

  const handleCopy = (text: string, type: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    snackbar.info(`Copied ${type === 'id' ? 'Login ID' : 'Password'} to clipboard`);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.loginId.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Employee Directory"
      subtitle="Manage organization employees, view Login IDs, and register new workforce members"
      badge="Admin"
      action={
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Employee
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Name, Login ID (e.g. OIJODO20220001), Department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-muted/20"
            />
          </div>
        </div>

        {/* Employee Directory Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">System Login ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                          <img src={emp.avatarUrl || '/user.png'} alt={emp.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                        {emp.loginId}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground text-[11px] font-semibold">
                        {emp.role === 'admin' ? <ShieldCheck className="h-3 w-3 text-accent" /> : <UserCheck className="h-3 w-3 text-accent" />}
                        <span className="capitalize">{emp.role}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-foreground">{emp.department}</p>
                      <p className="text-[11px] text-muted-foreground">{emp.designation}</p>
                    </td>

                    <td className="p-4 text-muted-foreground">{emp.joinDate}</td>

                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal 1: Add Employee Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Register a new employee. The system will automatically compute their unique Login ID and initial temporary password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">First Name</Label>
                <Input
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Last Name</Label>
                <Input
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Corporate Email</Label>
                <Input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 019-2345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Designation</Label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Join Date</Label>
                <DatePicker
                  value={joinDate}
                  onChange={setJoinDate}
                  className="w-full h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">System Role</Label>
                <CustomSelect
                  value={role}
                  onValueChange={(val) => setRole(val as 'admin' | 'employee')}
                  options={[
                    { label: 'Employee', value: 'employee' },
                    { label: 'Admin / HR Officer', value: 'admin' },
                  ]}
                  className="w-full h-9 text-xs"
                />
              </div>
            </div>



            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs hover:bg-muted hover:text-foreground">
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground text-xs font-bold">
                Create & Generate Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Generated Credentials Confirmation Dialog */}
      {createdEmpInfo && (
        <Dialog open={!!createdEmpInfo} onOpenChange={() => setCreatedEmpInfo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <Check className="h-5 w-5" />
              </div>
              <DialogTitle>Employee Created Successfully!</DialogTitle>
              <DialogDescription>
                Share these system-generated credentials with <strong>{createdEmpInfo.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Login ID Box */}
              <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">System Login ID</span>
                  <span className="font-mono font-bold text-accent text-base">{createdEmpInfo.loginId}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdEmpInfo.loginId, 'id')}
                  className="h-8 text-xs gap-1"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId ? 'Copied' : 'Copy ID'}
                </Button>
              </div>

              {/* Temporary Password Box */}
              <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Temporary Password</span>
                  <span className="font-mono font-bold text-foreground text-base">{createdEmpInfo.temporaryPassword}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdEmpInfo.temporaryPassword || '', 'pass')}
                  className="h-8 text-xs gap-1"
                >
                  {copiedPass ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedPass ? 'Copied' : 'Copy Password'}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground bg-accent/5 p-2.5 rounded-md border border-accent/20">
                💡 The employee can sign in at <span className="font-mono font-semibold">/auth/login</span> using their Login ID and initial password, and can change their password anytime.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => setCreatedEmpInfo(null)} className="bg-accent text-accent-foreground text-xs font-bold w-full">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
}
