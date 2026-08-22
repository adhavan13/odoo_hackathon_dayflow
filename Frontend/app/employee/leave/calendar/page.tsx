'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function EmployeeLeaveCalendarPage() {
  return (
    <PageContainer
      title="My Time Off Calendar"
      subtitle="Full 12-month annual calendar view highlighting your approved, pending, and refused time off alongside public holidays"
      badge="Employee"
    >
      <TimeOffView forcedRole="employee" />
    </PageContainer>
  );
}
