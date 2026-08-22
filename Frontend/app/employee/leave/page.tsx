'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { EmployeeLeaveView } from '@/components/leave/EmployeeLeaveView';

export default function EmployeeLeavePage() {
  return (
    <PageContainer
      title="My Time Off & Leave Applications"
      subtitle="View personal leave balances, track submitted requests status, and apply for new time off"
      badge="Employee View"
    >
      <EmployeeLeaveView />
    </PageContainer>
  );
}
