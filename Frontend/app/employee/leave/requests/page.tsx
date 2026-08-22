'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function MyLeaveRequestsPage() {
  return (
    <PageContainer
      title="My Time Off & Applications"
      subtitle="View your personal time off records, check available days balance, and submit new leave requests"
      badge="Employee"
    >
      <TimeOffView forcedRole="employee" />
    </PageContainer>
  );
}
