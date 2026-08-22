'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { EmployeeLeaveCalendarView } from '@/components/leave/EmployeeLeaveCalendarView';

export default function EmployeeLeaveCalendarPage() {
  return (
    <PageContainer
      title="Leave Calendar & Public Holidays"
      subtitle="Interactive 12-month annual schedule tracking your leave days alongside 2026 official public holidays"
      badge="Calendar & Holidays"
    >
      <EmployeeLeaveCalendarView />
    </PageContainer>
  );
}
