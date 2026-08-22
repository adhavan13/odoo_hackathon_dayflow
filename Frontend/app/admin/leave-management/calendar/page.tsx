'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function AdminLeaveCalendarPage() {
  return (
    <PageContainer
      title="Workforce Time Off Calendar"
      subtitle="Full 12-month calendar matrix displaying approved, pending, and refused time off across all departments"
      badge="Admin / HR"
    >
      <TimeOffView forcedRole="admin" />
    </PageContainer>
  );
}
