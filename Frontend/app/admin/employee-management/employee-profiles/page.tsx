'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  UserCheck,
  Search,
  Clock,
  Banknote,
  CheckCircle2,
  AlertCircle,
  FileText,
  Badge,
} from 'lucide-react';
import { useEmployeeStore, Employee } from '@/store/useEmployeeStore';
import { PageContainer } from '@/components/ui/page-container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EmployeeProfilesPage() {
  const { employees, fetchEmployees, isLoading } = useEmployeeStore();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.loginId && emp.loginId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Employee Profiles"
      subtitle="Detailed employee personnel records, attendance status, and role assignments"
      badge="Admin Portal"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Employee List Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search employees by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs bg-card"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-2 space-y-1.5 max-h-[600px] overflow-y-auto shadow-2xs">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmp?.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-accent/15 border border-accent/40 shadow-xs'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="h-11 w-11 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent text-xs overflow-hidden shrink-0">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" />
                    ) : (
                      emp.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                        {emp.name}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-accent">
                        {emp.loginId || 'EMP-1001'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{emp.designation}</p>
                  </div>
                </div>
              );
            })}

            {filteredEmployees.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No employees matching query.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Comprehensive Profile Details Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedEmp ? (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Header Profile Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/60 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-accent text-xl sm:text-2xl overflow-hidden shrink-0 shadow-md">
                    {selectedEmp.avatarUrl ? (
                      <img src={selectedEmp.avatarUrl} alt={selectedEmp.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedEmp.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-extrabold text-foreground">{selectedEmp.name}</h2>
                      <span className="font-mono text-xs font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/30">
                        {selectedEmp.loginId || 'EMP-1001'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-accent">{selectedEmp.designation}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {selectedEmp.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Grid 1: Key Employment Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Building2 className="h-4 w-4 text-accent" />
                    <span>Department & Position</span>
                  </div>
                  <div className="space-y-1 pt-1 text-muted-foreground">
                    <p>Department: <strong className="text-foreground">{selectedEmp.department}</strong></p>
                    <p>Designation: <strong className="text-foreground">{selectedEmp.designation}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span>Role & System Credentials</span>
                  </div>
                  <div className="space-y-1 pt-1 text-muted-foreground">
                    <p>System Role: <strong className="text-foreground capitalize">{selectedEmp.role}</strong></p>
                    <p>Joining Date: <strong className="text-foreground">{selectedEmp.joinDate || '2023-01-15'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Contact Information */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  <span>Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg border border-border/60 flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Corporate Email</span>
                      <span className="font-semibold text-foreground">{selectedEmp.email}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border/60 flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Mobile Phone</span>
                      <span className="font-semibold text-foreground">{selectedEmp.phone || '+1 (555) 019-2834'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground border border-border rounded-2xl bg-card">
              Loading employee profile data...
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
