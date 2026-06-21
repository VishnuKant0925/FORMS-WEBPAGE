'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topnav  from '@/components/layout/Topnav';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (pathname.startsWith('/admin') && user.role !== 'admin' && user.role !== 'hr') {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', gap: '16px',
      }}>
        <div style={{
          width: '40px', height: '40px', background: 'var(--primary)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: '9px', fontWeight: 800, letterSpacing: '0.04em' }}>NRSC</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={18} style={{ color: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto 6px' }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Double check admin route role protection to prevent flash of content
  if (pathname.startsWith('/admin') && user.role !== 'admin' && user.role !== 'hr') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Topnav />
      <main className="dashboard-content" id="main-content">
        {children}
      </main>
    </div>
  );
}
