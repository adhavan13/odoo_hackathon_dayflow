'use client';

import React, { useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { AiAssistantWidget } from '@/components/ai-assistant/AiAssistantWidget';
import { useAuthStore } from '@/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { checkAuthMe } = useAuthStore();

  useEffect(() => {
    checkAuthMe();
  }, [checkAuthMe]);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <AiAssistantWidget />
      <Toaster position="top-right" closeButton />
    </div>
  );
}
