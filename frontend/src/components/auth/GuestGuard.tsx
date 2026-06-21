'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#0B3C6D] animate-spin" />
        <span className="text-sm font-semibold text-[#486581]">Loading...</span>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
