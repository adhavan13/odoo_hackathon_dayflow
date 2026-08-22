import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { HelpDocumentationView } from '@/components/docs/HelpDocumentationView';

export default function AdminDocsPage() {
  return (
    <PageContainer
      title="Help & Documentation"
      subtitle="Comprehensive HRMS functional specifications, workflow guides, and system rules"
      badge="Admin"
    >
      <HelpDocumentationView />
    </PageContainer>
  );
}
