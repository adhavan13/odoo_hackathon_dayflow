'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { AdminLeaveApprovalView } from '@/components/leave/AdminLeaveApprovalView';

export default function AdminLeaveManagementPage() {
  return (
    <PageContainer
      title="Leave Requests & HR Approval Hub"
      subtitle="Review pending employee applications, inspect Cloudinary medical certificates, approve or reject leave, and track HR metrics"
      badge="Admin / HR Approval"
    >
      <AdminLeaveApprovalView />
    </PageContainer>
  );
}
