'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNgosAlias() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/ngo-network');
  }, [router]);

  return <div className="p-8 text-center text-xs text-slate-400">Loading NGO network...</div>;
}
