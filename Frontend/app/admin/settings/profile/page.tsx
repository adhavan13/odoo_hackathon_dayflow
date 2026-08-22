'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings/organization');
  }, [router]);

  return null;
}
