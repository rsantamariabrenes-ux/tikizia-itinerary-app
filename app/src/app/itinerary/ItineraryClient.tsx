'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SessionData } from '@/lib/types';

export default function ItineraryClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [html, setHtml] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.get('error')) {
      setError('Something went wrong generating your itinerary. Please try again.');
      return;
    }

    if (params.get('exhausted')) {
      setError('You have used all 5 generations for this purchase.');
      return;
    }

    const sessionRaw = sessionStorage.getItem('tikizia_session');
    const itineraryHtml = sessionStorage.getItem('tikizia_itinerary');

    if (!sessionRaw || !itineraryHtml) {
      router.replace('/');
      return;
    }

    setSession(JSON.parse(sessionRaw));
    setHtml(itineraryHtml);
  }, [router, params]);

  function handlePrint() {
    window.print();
  }

  if (error) {
    const isExhausted = params.get('exhausted') === 'true';
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">{isExhausted ? '🎉' : '⚠️'}</div>
        <h1 className="text-2xl font-bold mb-4 text-stone-800">
          {isExhausted ? 'All generations used!' : 'Generation Error'}
        </h1>
        <p className="text-stone-600 mb-8 max-w-md">{error}</p>
        {isExhausted ? (
          <a
            href="https://exploretikizia.com"
            className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-500 transition-colors"
          >
            Plan Another Trip →
          </a>
        ) : (
          <button
            onClick={() => router.push('/generating')}
            className="bg-green-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            Try Again
          </button>
        )}
      </main>
    );
  }

  if (!html || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Loading your itinerary...</p>
      </main>
    );
  }

  const remaining = session.generationsRemaining;
  const isExhausted = remaining <= 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <span className="text-green-800 font-bold">🌿 TikiZia</span>
          <span className="text-stone-400">|</span>
          <span className="text-sm text-stone-600">
            {remaining} of 5 generation{remaining !== 1 ? 's' : ''} remaining
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm border border-stone-200 rounded-lg hover:border-stone-400 transition-colors"
          >
            Print / Save PDF
          </button>
          {!isExhausted && (
            <button
              onClick={() => router.push('/quiz')}
              className="px-4 py-2 text-sm bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Adjust & Regenerate →
            </button>
          )}
          {isExhausted && (
            <a
              href="https://exploretikizia.com"
              className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
            >
              Plan Another Trip →
            </a>
          )}
        </div>
      </div>

      {/* Itinerary rendered in iframe */}
      <iframe
        srcDoc={html}
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 56px)' }}
        title="Your Costa Rica Itinerary"
      />

      {/* Re-purchase banner when exhausted */}
      {isExhausted && (
        <div className="print:hidden bg-amber-50 border-t border-amber-200 px-6 py-4 text-center">
          <p className="text-amber-800 font-semibold mb-2">
            You&apos;ve used all 5 generations for this purchase.
          </p>
          <p className="text-amber-700 text-sm mb-4">
            Ready to plan another Costa Rica adventure?
          </p>
          <a
            href="https://exploretikizia.com"
            className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors"
          >
            Get Another Itinerary →
          </a>
        </div>
      )}
    </div>
  );
}
