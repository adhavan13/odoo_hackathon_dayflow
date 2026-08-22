'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useEmployeeStore, Employee } from '@/store';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { generateLoginId, generateTemporaryPassword } from '@/utils/idGenerator';
import { snackbar } from '@/utils/snackbar';
import {
  Search,
  Plus,
  Plane,
  ShieldCheck,
  UserCheck,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

export default function AdminOverviewPage() {
  const { employees, fetchEmployees, addEmployee } = useEmployeeStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch live backend employees on page mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Selected Employee for View-Only Modal
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // New Employee Modal
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

  // Mock initial attendance status mapping
  const getEmployeeStatus = (emp: Employee): 'Present' | 'On Leave' | 'Absent' => {
    if (emp.role === 'admin') return 'Present';
    if (emp.name.toLowerCase().includes('alex')) return 'Present';
    if (emp.name.toLowerCase().includes('sarah')) return 'Present';
    if (emp.id.endsWith('3') || emp.name.toLowerCase().includes('john')) return 'On Leave';
    if (emp.status === 'Inactive') return 'Absent';
    return emp.status === 'On Leave' ? 'On Leave' : 'Present';
  };

  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'loginId' | 'dept' | 'newest' | 'oldest'>('name-asc');

  const filteredEmployees = employees
    .filter((emp) => {
      const currentStatus = getEmployeeStatus(emp);

      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.loginId?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'present'
          ? currentStatus === 'Present'
          : statusFilter === 'on-leave'
          ? currentStatus === 'On Leave'
          : statusFilter === 'absent'
          ? currentStatus === 'Absent'
          : true;

      const matchesDept = deptFilter === 'all' ? true : emp.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'loginId') return (a.loginId || '').localeCompare(b.loginId || '');
      if (sortBy === 'dept') return a.department.localeCompare(b.department);
      if (sortBy === 'newest') return new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.joinDate || 0).getTime() - new Date(b.joinDate || 0).getTime();
      return 0;
    });

  return (
    <PageContainer
      title="Employees"
      subtitle="Workforce directory, admin-created employees, and real-time attendance status indicators"
      badge="Admin"
      action={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold gap-1 px-4 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            NEW
          </Button>

          <div className="flex items-center p-0.5 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Search, Sort & Status Filter Toolbar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-4">
          {/* Row 1: Search Bar & Sorting Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employee name, Login ID (e.g. OIJODO20220001)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-muted/20"
              />
            </div>

            {/* Sorting Dropdown & Result Count */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 text-accent shrink-0" />
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: 'name-asc', label: 'Sort: Name (A - Z)' },
                    { value: 'name-desc', label: 'Sort: Name (Z - A)' },
                    { value: 'loginId', label: 'Sort: Login ID' },
                    { value: 'dept', label: 'Sort: Department' },
                    { value: 'newest', label: 'Sort: Join Date (Newest)' },
                    { value: 'oldest', label: 'Sort: Join Date (Oldest)' },
                  ]}
                  className="w-48 h-9 text-xs"
                />
              </div>

              <span className="text-xs text-muted-foreground font-mono font-bold shrink-0 hidden md:inline">
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Row 2: Status Pills & Department Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-xs">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'present', label: 'Present' },
                { id: 'on-leave', label: 'On Leave' },
                { id: 'absent', label: 'Absent' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-card text-accent shadow-xs border border-accent/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Department Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <CustomSelect
                value={deptFilter}
                onChange={setDeptFilter}
                options={[
                  { value: 'all', label: 'All Departments' },
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'Human Resources', label: 'Human Resources' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Marketing', label: 'Marketing' },
                ]}
                className="w-48 h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Employee Cards Grid View (Matching Wireframe 1) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => {
              const currentStatus = getEmployeeStatus(emp);

              return (
                <div
                  key={emp.id}
                  onClick={() => setViewingEmployee(emp)}
                  className="group relative rounded-2xl border border-border bg-card p-5 text-left shadow-2xs hover:shadow-xl hover:border-accent/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Top-Right Status Indicator Icon */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {currentStatus === 'Present' && (
                      <span
                        className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        title="Green dot: Employee is present in the office"
                      />
                    )}
                    {currentStatus === 'On Leave' && (
                      <div
                        className="h-6 w-6 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center border border-blue-500/30"
                        title="Airplane icon: Employee is on leave"
                      >
                        <Plane className="h-3.5 w-3.5 transform -rotate-45" />
                      </div>
                    )}
                    {currentStatus === 'Absent' && (
                      <span
                        className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                        title="Yellow dot: Employee is absent"
                      />
                    )}
                  </div>

                  {/* Card Body: Profile Picture & Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-accent text-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" />
                      ) : (
                        emp.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-0.5 truncate pr-6">
                      <h3 className="font-bold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-medium text-accent truncate">{emp.designation}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{emp.department}</p>
                    </div>
                  </div>

                  {/* Card Footer: Login ID Pill */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border">
                      {emp.loginId || 'OIJODO20220001'}
                    </span>

                    <span className="text-[11px] text-accent font-semibold group-hover:underline">
                      View Profile →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View Alternative */
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-right">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEmployees.map((emp) => {
                  const currentStatus = getEmployeeStatus(emp);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setViewingEmployee(emp)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" />
                            ) : (
                              emp.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{emp.name}</p>
                            <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-accent">{emp.loginId || 'OIJODO20220001'}</td>
                      <td className="p-4 capitalize">{emp.role}</td>
                      <td className="p-4">{emp.department}</td>
                      <td className="p-4 text-right">
                        {currentStatus === 'Present' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present
                          </span>
                        )}
                        {currentStatus === 'On Leave' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500">
                            <Plane className="h-3.5 w-3.5" /> On Leave
                          </span>
                        )}
                        {currentStatus === 'Absent' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Clickable Card View-Only Employee Profile Dialog */}
      {viewingEmployee && (
        <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
          <DialogContent className="sm:max-w-5xl w-full max-w-[96vw] max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
            <DialogHeader className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-accent" />
                  Employee Profile Information (View-Only Mode)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Viewing detailed information for <strong className="text-foreground">{viewingEmployee.name}</strong> (<span className="font-mono text-accent">{viewingEmployee.loginId || viewingEmployee.employeeId}</span>)
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="py-4">
              <UserProfileView isAdminView={true} employeeData={viewingEmployee} isReadOnly={true} />
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button onClick={() => setViewingEmployee(null)} className="bg-accent text-accent-foreground text-xs font-bold px-6 cursor-pointer">
                Close Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal 2: Add Employee Dialog */}
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

      {/* Modal 3: Generated Credentials Confirmation Dialog */}
      {createdEmpInfo && (
        <Dialog open={!!createdEmpInfo} onOpenChange={() => setCreatedEmpInfo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Employee Created Successfully!</DialogTitle>
              <DialogDescription>
                Share these system-generated credentials with <strong>{createdEmpInfo.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
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
