'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { AdminLeaveScheduleView } from '@/components/leave/AdminLeaveScheduleView';

export default function AdminLeaveCalendarPage() {
  return (
    <PageContainer
      title="Company Workforce Schedule & Allocations"
      subtitle="Workforce absence coverage calendar, annual leave quota usage per employee, and public holiday schedule"
      badge="Admin / HR Schedule"
    >
      <AdminLeaveScheduleView />
    </PageContainer>
  );
}
