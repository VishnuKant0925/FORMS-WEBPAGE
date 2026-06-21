'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function SplashPage() {
  const router    = useRouter();
  const { user, isLoading } = useAuthStore();
  const [ready, setReady]   = useState(false);

  // Wait 4.4s then redirect
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 4400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready && !isLoading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [ready, isLoading, user, router]);

  return (
    <div className="sr-only" role="status" aria-label="Loading NRSC Smart Leave Management System">
      <h1>National Remote Sensing Centre</h1>
      <h2>राष्ट्रीय सुदूर संवेदन केन्द्र</h2>
      <h3>Smart Leave Management System</h3>
      <p>Digital Leave Management Portal</p>
    </div>
  );
}
