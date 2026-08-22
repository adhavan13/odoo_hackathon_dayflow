'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/employee/profile/personal-info');
  }, [router]);
  return null;
}
