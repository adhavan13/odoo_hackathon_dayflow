'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminEmployeesPage from '../employees/page';

export default function AdminOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/employees');
  }, [router]);

  return <AdminEmployeesPage />;
}
