import React from 'react';
import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Admin Portal | Dayflow HRMS',
  description: 'Admin and HR Officer management portal for workforce analytics, attendance, leave approvals, and payroll processing.',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
