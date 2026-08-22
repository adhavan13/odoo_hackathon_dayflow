'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { HRAnalyticsView } from '@/components/dashboard/HRAnalyticsView';

export default function HRAnalyticsPage() {
  return (
    <PageContainer
      title="HR Analytics & Workforce Visualizations"
      subtitle="Interactive Recharts graphics, attendance trends, leave application distributions, and departmental headcounts"
      badge="Admin / HR Visualizations"
    >
      <HRAnalyticsView />
    </PageContainer>
  );
}
