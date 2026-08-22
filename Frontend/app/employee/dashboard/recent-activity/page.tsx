'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { RecentActivityView } from '@/components/dashboard/RecentActivityView';

export default function EmployeeRecentActivityPage() {
  return (
    <PageContainer
      title="Recent System Activity & Analytics"
      subtitle="Audit timeline of recent clock-ins, leave requests, profile updates, and security logs with live API analytics"
      badge="Activity Log"
    >
      <RecentActivityView />
    </PageContainer>
  );
}
