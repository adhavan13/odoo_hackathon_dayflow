'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  UserCheck,
  KeyRound,
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Banknote,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ModuleGuide {
  id: string;
  title: string;
  category: 'auth' | 'dashboard' | 'profile' | 'attendance' | 'leave' | 'payroll' | 'analytics';
  targetRole: 'all' | 'admin' | 'employee';
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    details?: string[];
  }[];
  specifications: string[];
}

const docModules: ModuleGuide[] = [
  {
    id: 'm-auth',
    title: '3.1 Authentication & Authorization',
    category: 'auth',
    targetRole: 'all',
    icon: KeyRound,
    summary: 'Secure user onboarding, role selection (Admin / HR vs Employee), email/password login, and session control.',
    steps: [
      {
        stepNumber: 1,
        title: 'User Registration (Sign Up)',
        description: 'New workforce members register using Employee ID, Corporate Email, Password, and designated Role.',
        details: [
          'Required Fields: Employee ID, Email, Password, Role (Employee or Admin/HR)',
          'Password rules: Minimum 8 characters with mix of letters, numbers, and special characters',
          'Verification: Email verification required prior to full account activation',
        ],
      },
      {
        stepNumber: 2,
        title: 'User Sign In',
        description: 'Authenticate securely using registered email and password credentials.',
        details: [
          'Error Handling: Incorrect credentials trigger real-time validation alerts',
          'Redirection: Successful login automatically routes Admin to /admin/dashboard and Employee to /employee/dashboard',
        ],
      },
    ],
    specifications: [
      'Role-based Access Control (RBAC) enforced on all API endpoints and frontend route guards',
      'JWT Bearer Token authorization header stored securely in authenticated session',
    ],
  },
  {
    id: 'm-dashboard',
    title: '3.2 Dashboard Systems',
    category: 'dashboard',
    targetRole: 'all',
    icon: LayoutDashboard,
    summary: 'Role-specific overview portals for management decision-making and employee self-service access.',
    steps: [
      {
        stepNumber: 1,
        title: 'Employee Self-Service Dashboard',
        description: 'Centralized portal displaying quick-access cards for personal profile, daily check-in, leave status, and recent activity.',
        details: [
          'Quick Cards: My Profile, Attendance Check-In/Out, Leave Balances, Payslips',
          'Recent Activity: Real-time logs of submitted requests and announcements',
        ],
      },
      {
        stepNumber: 2,
        title: 'Admin / HR Officer Dashboard',
        description: 'Comprehensive workforce management dashboard with organization-wide analytics and pending approval queues.',
        details: [
          'Workforce Metrics: Active employees, today\'s attendance rate, pending leave requests',
          'Quick Approvals: Instant one-click review for employee leave and shift adjustment requests',
        ],
      },
    ],
    specifications: [
      'Real-time notification badges for unread admin alerts',
      'Dual portal separation ensuring clean boundaries between admin privileges and self-service',
    ],
  },
  {
    id: 'm-profile',
    title: '3.3 Employee Profile Management',
    category: 'profile',
    targetRole: 'all',
    icon: User,
    summary: '360-degree employee records including personal details, job position, bank accounts, skills, and salary structures.',
    steps: [
      {
        stepNumber: 1,
        title: 'Viewing Profile Information',
        description: 'Access complete form views containing Resume, Private Information, and Salary Details.',
        details: [
          'Resume Tab: About, What I love about my job, Hobbies, Skills, Certifications',
          'Private Info Tab: DOB, Residing Address, Nationality, Personal Email, Gender, Marital Status, Date of Joining',
          'Bank Details: Account Number, Bank Name, IFSC Code, PAN No, UAN No, Emp Code',
        ],
      },
      {
        stepNumber: 2,
        title: 'Edit Permissions & Photo Upload',
        description: 'Employees can edit limited fields (phone, address, profile photo), while Admin holds full edit control.',
        details: [
          'Profile Photo: Upload high-res images directly via Cloudinary integration',
          'Admin Editing: Full override authority over designation, department, and salary components',
        ],
      },
    ],
    specifications: [
      'Salary Info tab is restricted exclusively to Admin roles for confidentiality',
      'Real-time image preview and validation prior to cloud upload',
    ],
  },
  {
    id: 'm-attendance',
    title: '3.4 Attendance Management',
    category: 'attendance',
    targetRole: 'all',
    icon: Clock,
    summary: 'Daily and weekly shift tracking, automated check-in / check-out actions, and status categorizations.',
    steps: [
      {
        stepNumber: 1,
        title: 'Shift Check-In & Check-Out',
        description: 'Employees record daily attendance with a single click from their dashboard or attendance tab.',
        details: [
          'Check-In: Records exact timestamp and marks status as Present or Late',
          'Check-Out: Calculates total active working hours and updates daily log',
        ],
      },
      {
        stepNumber: 2,
        title: 'Workforce Attendance Logs (Admin View)',
        description: 'HR officers filter and inspect attendance records across departments.',
        details: [
          'Status Types: Present, Absent, Half-Day, On Leave, Late Entry',
          'Reports: Exportable weekly and monthly workforce attendance summaries',
        ],
      },
    ],
    specifications: [
      'Employees are restricted strictly to viewing their own personal attendance logs',
      'Automated work hours calculation subtracting break times',
    ],
  },
  {
    id: 'm-leave',
    title: '3.5 Leave & Time-Off Management',
    category: 'leave',
    targetRole: 'all',
    icon: CalendarDays,
    summary: 'Multi-type leave application workflow with real-time status updates and admin approval management.',
    steps: [
      {
        stepNumber: 1,
        title: 'Applying for Leave (Employee)',
        description: 'Submit formal time-off applications with start/end dates, leave category, and justification remarks.',
        details: [
          'Leave Categories: Casual Leave, Sick Leave, Paid Leave, Unpaid Leave, Maternity Leave',
          'Request Lifecycle: Automatically created in Pending status upon submission',
        ],
      },
      {
        stepNumber: 2,
        title: 'Leave Review & Approval Workflow (Admin)',
        description: 'HR officers review pending requests and issue instant approvals or rejections with comments.',
        details: [
          'Review Options: Approve or Reject request with administrative notes',
          'Instant Sync: Decisions immediately adjust employee leave balances and shift schedules',
        ],
      },
    ],
    specifications: [
      'Visual leave calendar interface mapping upcoming team absences',
      'Toast notification alerts triggered upon status change',
    ],
  },
  {
    id: 'm-payroll',
    title: '3.6 Payroll & Salary Structure',
    category: 'payroll',
    targetRole: 'admin',
    icon: Banknote,
    summary: 'Automated wage component calculator, Provident Fund (PF) contributions, tax deductions, and salary slip generation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Wage Definition & Automatic Component Calculation',
        description: 'Admin inputs Monthly Wage (e.g. ₹50,000) and the system automatically computes all breakdown items.',
        details: [
          'Yearly Wage: Monthly Wage × 12 (e.g. ₹6,00,000 / Year)',
          'Basic Salary: 50.00% of Monthly Wage (₹25,000.00)',
          'House Rent Allowance (HRA): 50.00% of Basic Salary (₹12,500.00)',
          'Standard Allowance: ₹4,167.00 / month (fixed standard)',
          'Performance Bonus: 8.33% of Basic Salary (₹2,082.50)',
          'Leave Travel Allowance (LTA): 8.33% of Basic Salary (₹2,082.50)',
          'Fixed Allowance: Auto-remainder = Wage - Total(all components) (₹2,918.00)',
        ],
      },
      {
        stepNumber: 2,
        title: 'Deductions & Statutory Contributions',
        description: 'System automatically calculates employer/employee PF and Professional Tax.',
        details: [
          'Provident Fund (PF): 12.00% of Basic Salary (₹3,000 Employee + ₹3,000 Employer)',
          'Professional Tax: Fixed ₹200.00 / month deducted from Gross Salary',
        ],
      },
    ],
    specifications: [
      'Employees have read-only visibility over finalized salary slips and payslips',
      'Component breakdown auto-updates dynamically whenever Monthly Wage is modified',
    ],
  },
  {
    id: 'm-analytics',
    title: '3.7 Analytics, Reports & Export',
    category: 'analytics',
    targetRole: 'admin',
    icon: FileSpreadsheet,
    summary: 'Workforce analytics, downloadable salary slips, attendance reports, and system audit logs.',
    steps: [
      {
        stepNumber: 1,
        title: 'Workforce Analytics',
        description: 'Interactive charts mapping headcount trends, attendance ratios, and department breakdowns.',
        details: [
          'Headcount Metrics: Active employees, turnover rate, department distribution',
          'Payroll Slips: Generate and download PDF salary slips for individual employees',
        ],
      },
    ],
    specifications: [
      'Export capabilities for CSV/PDF report generation',
      'System-wide audit trail for all policy modifications',
    ],
  },
];

export function HelpDocumentationView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all');
  const [expandedModules, setExpandedModules] = useState<string[]>(docModules.map((m) => m.id));

  const toggleExpand = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const filteredModules = docModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.steps.some(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRole =
      roleFilter === 'all' || module.targetRole === 'all' || module.targetRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Interactive HRMS System Manual & Guide</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Dayflow Documentation & Workflow Guide
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete functional requirements, step-by-step guides, role-based access rules, and automated calculation specifications for Admin Officers and Employees.
          </p>

          {/* Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search modules, workflows, rules, calculations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-muted/30"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center p-1 bg-muted/60 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Modules
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Guide
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('employee')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  roleFilter === 'employee'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Employee Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Module List Accordion Cards */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Info className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No documentation modules found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try refining your search query or role filter.</p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const ModuleIcon = module.icon;
            const isExpanded = expandedModules.includes(module.id);

            return (
              <div key={module.id} className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-2xs">
                {/* Module Header Button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(module.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-0.5 border border-accent/20">
                      <ModuleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-foreground">{module.title}</h2>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {module.targetRole === 'admin' ? (
                            <>
                              <ShieldCheck className="h-3 w-3 text-accent" /> Admin Only
                            </>
                          ) : module.targetRole === 'employee' ? (
                            <>
                              <UserCheck className="h-3 w-3 text-accent" /> Employee Only
                            </>
                          ) : (
                            'Admin & Employee'
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{module.summary}</p>
                    </div>
                  </div>

                  <div className="text-muted-foreground p-1 shrink-0">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </button>

                {/* Module Body Content */}
                {isExpanded && (
                  <div className="border-t border-border/60 p-6 bg-card space-y-6">
                    {/* Workflow Steps Grid */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        Step-by-Step Workflow Guide
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {module.steps.map((step) => (
                          <div key={step.stepNumber} className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                                {step.stepNumber}
                              </span>
                              <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed pl-8">{step.description}</p>

                            {step.details && (
                              <ul className="space-y-1.5 pl-8 pt-2">
                                {step.details.map((detail, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    {module.specifications.length > 0 && (
                      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
                        <h4 className="text-xs font-bold text-accent flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          System Specifications & Enforcement Rules
                        </h4>
                        <ul className="space-y-1.5">
                          {module.specifications.map((spec, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
