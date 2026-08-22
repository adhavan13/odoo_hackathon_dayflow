import React from 'react';
import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Employee Portal | Dayflow HRMS',
  description: 'Employee self-service portal for time off, check in/out, profile management, and salary slips.',
};

export default function EmployeeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
