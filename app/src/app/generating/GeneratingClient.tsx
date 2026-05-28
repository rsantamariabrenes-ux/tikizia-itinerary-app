'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionData, QuizAnswers } from '@/lib/types';

const MESSAGES = [
  'Reading your travel preferences...',
  'Checking local tour availability...',
  'Mapping your destinations...',
  "Consulting Rod's knowledge base...",
  'Crafting your day-by-day plan...',
  'Adding local restaurant picks...',
  'Building your personalized itinerary...',
];

export default function GeneratingClient() {
  const router = useRouter();
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    async function generate() {
      const sessionRaw = sessionStorage.getItem('tikizia_session');
      const answersRaw = sessionStorage.getItem('tikizia_answers');

      if (!sessionRaw || !answersRaw) {
        router.replace('/');
        return;
      }

      const session: SessionData = JSON.parse(sessionRaw);
      const answers: QuizAnswers = JSON.parse(answersRaw);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.token, answers }),
        });

        if (res.status === 403) {
          router.replace('/itinerary?exhausted=true');
          return;
        }

        if (!res.ok) throw new Error('Generation failed');

        const data = await res.json();

        sessionStorage.setItem(
          'tikizia_session',
          JSON.stringify({ ...session, generationsRemaining: data.generationsRemaining })
        );

        sessionStorage.setItem('tikizia_itinerary', data.html);

        router.replace('/itinerary');
      } catch {
        router.replace('/itinerary?error=true');
      }
    }

    generate();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-green-900 to-green-800">
      <div className="text-6xl mb-8 animate-bounce">🌿</div>
      <h1 className="text-2xl font-bold text-white mb-4">
        Building your Costa Rica itinerary...
      </h1>
      <p className="text-green-200 mb-12">This takes about 20–40 seconds. Worth the wait!</p>
      <div className="space-y-3 text-green-300 text-sm">
        {MESSAGES.map((msg, i) => (
          <p key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}>
            {msg}
          </p>
        ))}
      </div>
    </main>
  );
}
