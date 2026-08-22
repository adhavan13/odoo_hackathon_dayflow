'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function LeaveBalancePage() {
  return (
    <PageContainer
      title="Time Off Balance & Allocations"
      subtitle="Overview of available annual time off quotas, remaining days, and leave history"
      badge="Employee"
    >
      <TimeOffView forcedRole="employee" />
    </PageContainer>
  );
}
