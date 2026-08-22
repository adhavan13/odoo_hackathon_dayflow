import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { UserProfileView } from '@/components/profile/UserProfileView';

export default function AdminProfilePage() {
  return (
    <PageContainer
      title="My Profile"
      subtitle="Manage your personal profile, credentials, organization details, and salary configuration"
      badge="Admin"
    >
      <UserProfileView isAdminView={true} />
    </PageContainer>
  );
}
