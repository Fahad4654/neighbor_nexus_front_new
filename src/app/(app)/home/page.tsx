'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Content has been removed */}
    </div>
  );
}
