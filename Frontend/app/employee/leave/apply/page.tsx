'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { TimeOffView } from '@/components/leave/TimeOffView';

export default function ApplyLeavePage() {
  return (
    <PageContainer
      title="Apply for Time Off"
      subtitle="Submit a new paid time off, sick leave, or unpaid leave application"
      badge="Employee"
    >
      <TimeOffView forcedRole="employee" />
    </PageContainer>
  );
}
