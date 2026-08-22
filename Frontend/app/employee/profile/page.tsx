import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { UserProfileView } from '@/components/profile/UserProfileView';

export default function EmployeeProfilePage() {
  return (
    <PageContainer
      title="My Profile"
      subtitle="View and manage your personal details, resume, skills, and bank information"
      badge="Employee"
    >
      <UserProfileView isAdminView={false} />
    </PageContainer>
  );
}
