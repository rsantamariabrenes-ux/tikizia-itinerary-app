'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AccessPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/access/${token}`);
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const data = await res.json();
        sessionStorage.setItem(
          'tikizia_session',
          JSON.stringify({ token, generationsRemaining: data.generationsRemaining })
        );
        router.replace('/quiz');
      } catch {
        setStatus('error');
      }
    }
    validate();
  }, [token, router]);

  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">❌</div>
        <h1 className="text-2xl font-bold text-red-800 mb-4">Invalid or expired link</h1>
        <p className="text-stone-600 max-w-md mb-8">
          This access link is not valid. Please check your purchase confirmation email
          and try the link again.
        </p>
        <a href="https://exploretikizia.com" className="text-green-700 underline">
          Back to Explore TikiZia
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin text-4xl mb-4">🌿</div>
      <p className="text-stone-600">Validating your access...</p>
    </main>
  );
}
