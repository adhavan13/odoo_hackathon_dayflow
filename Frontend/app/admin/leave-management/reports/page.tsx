'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLeaveReportsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/leave-management');
  }, [router]);
  return null;
}
