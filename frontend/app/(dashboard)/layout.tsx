'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getToken } from '@/lib/api';

const subscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const token = isClient ? getToken() : null;

  useEffect(() => {
    if (isClient && !token && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isClient, pathname, router, token]);

  if (!isClient || !token) return null;

  return (
    <div className="layout-container animate-fade-in-up">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
