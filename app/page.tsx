'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to interview start (no auth required)
    router.push('/interview/start');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="text-white text-2xl">Loading interview...</div>
    </div>
  );
}
