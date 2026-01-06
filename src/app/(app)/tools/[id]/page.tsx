
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer in use as of the refactor to move detail pages
// under `/rent/[id]`. This component will redirect users to the listings page.
// This file can be safely deleted in the future.

export default function OldListingDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools');
  }, [router]);

  return (
    <div>
        <p>This page has moved. Redirecting...</p>
    </div>
  );
}
