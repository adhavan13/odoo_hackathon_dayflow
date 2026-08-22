'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function AdminLeaveRequestsPage() {
  return (
    <PageContainer
      title="Time Off & Leave Approval"
      subtitle="View, approve, or reject employee time off applications, track allocations, and monitor annual balances"
      badge="Admin / HR"
    >
      <TimeOffView forcedRole="admin" />
    </PageContainer>
  );
}
