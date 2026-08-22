'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaveRequestsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/employee/leave');
  }, [router]);
  return null;
}
