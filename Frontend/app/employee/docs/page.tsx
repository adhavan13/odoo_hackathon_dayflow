import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { HelpDocumentationView } from '@/components/docs/HelpDocumentationView';

export default function EmployeeDocsPage() {
  return (
    <PageContainer
      title="Help & Documentation"
      subtitle="Comprehensive HRMS user guide, attendance rules, and leave request instructions"
      badge="Employee"
    >
      <HelpDocumentationView />
    </PageContainer>
  );
}
