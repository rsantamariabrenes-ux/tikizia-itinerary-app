'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QUIZ_QUESTIONS } from '@/lib/quiz-questions';
import { QuizAnswers, SessionData } from '@/lib/types';

const TOTAL_STEPS = QUIZ_QUESTIONS.length; // 12

const EMPTY_ANSWERS: QuizAnswers = {
  destinations: [],
  startDate: '',
  duration: '',
  travelers: '',
  tripGoal: '',
  activities: [],
  travelStyle: '',
  adventureLevel: 2,
  hikingInterest: 2,
  hasKids: false,
  kidsAges: '',
  transport: '',
  budget: '',
  hasAccommodation: false,
  extraContext: '',
};

export default function QuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = welcome, 1-12 = questions, 13 = final screen
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('tikizia_session');
    if (!raw) { router.replace('/'); return; }
    setSession(JSON.parse(raw));

    const savedAnswers = sessionStorage.getItem('tikizia_answers');
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, [router]);

  useEffect(() => {
    if (step > 0) {
      sessionStorage.setItem('tikizia_answers', JSON.stringify(answers));
    }
  }, [answers, step]);

  function handleSingleSelect(field: keyof QuizAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => setStep((s) => s + 1), 300);
  }

  function handleMultiSelect(field: keyof QuizAnswers, value: string) {
    setAnswers((prev) => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }

  function handleScale(field: keyof QuizAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => setStep((s) => s + 1), 300);
  }

  function handleYesNo(field: keyof QuizAnswers, value: boolean) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    if (!value) {
      setTimeout(() => setStep((s) => s + 1), 300);
    }
  }

  function handleNext() {
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleGenerate() {
    sessionStorage.setItem('tikizia_answers', JSON.stringify(answers));
    router.push('/generating');
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  // STEP 0: Welcome screen
  if (step === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-green-900 to-green-800">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Discover Your Perfect<br />Costa Rica Journey
        </h1>
        <p className="text-green-200 max-w-md mb-10 text-lg">
          Answer 12 quick questions and we&apos;ll build a day-by-day itinerary
          tailored exactly to your travel style — powered by local expertise and AI.
        </p>
        <div className="text-green-300 text-sm mb-8">
          {session.generationsRemaining} of 5 generations remaining
        </div>
        <button
          onClick={() => setStep(1)}
          className="bg-white text-green-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-colors shadow-lg"
        >
          Start the Quiz →
        </button>
      </main>
    );
  }

  // STEP 13: Final optional screen
  if (step === 13) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="h-2 bg-stone-200 rounded-full">
              <div className="h-2 bg-green-700 rounded-full w-full" />
            </div>
            <p className="text-sm text-stone-500 mt-2 text-right">Almost there!</p>
          </div>
          <h2 className="text-2xl font-bold mb-6">A few last details (optional)</h2>

          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Have you already booked accommodation?</label>
              <div className="flex gap-3">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers((prev) => ({ ...prev, hasAccommodation: opt === 'Yes' }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-colors ${
                      answers.hasAccommodation === (opt === 'Yes')
                        ? 'border-green-700 bg-green-50 text-green-900'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Anything else we should know?
                <span className="text-stone-400 font-normal ml-2">optional</span>
              </label>
              <textarea
                value={answers.extraContext}
                onChange={(e) => setAnswers((prev) => ({ ...prev, extraContext: e.target.value }))}
                placeholder="Dietary restrictions, mobility needs, special occasion (honeymoon, anniversary), places you&apos;ve already visited and don&apos;t want repeated..."
                rows={4}
                className="w-full border-2 border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-green-600 resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border-2 border-stone-200 font-semibold hover:border-stone-400 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 rounded-xl bg-green-800 text-white font-bold text-lg hover:bg-green-700 transition-colors"
            >
              Generate My Itinerary 🌿
            </button>
          </div>
        </div>
      </main>
    );
  }

  // STEPS 1-12: Questions
  const question = QUIZ_QUESTIONS[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-6 pt-10">
      <div className="w-full max-w-xl">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-stone-200 rounded-full">
            <div
              className="h-2 bg-green-700 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-stone-500 mt-2">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.subtext && <p className="text-stone-500 mb-6">{question.subtext}</p>}
        {!question.subtext && <div className="mb-6" />}

        {/* MULTI-SELECT */}
        {question.type === 'multi-select' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {question.options!.map((opt) => {
                const selected = (answers[question.id as keyof QuizAnswers] as string[]).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiSelect(question.id as keyof QuizAnswers, opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                      selected
                        ? 'border-green-700 bg-green-50 text-green-900'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={handleBack} className="px-5 py-3 rounded-xl border-2 border-stone-200 font-semibold hover:border-stone-400 transition-colors">← Back</button>
              <button
                onClick={handleNext}
                disabled={(answers[question.id as keyof QuizAnswers] as string[]).length === 0}
                className="flex-1 py-3 rounded-xl bg-green-800 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* SINGLE-SELECT */}
        {question.type === 'single-select' && (
          <div className="grid grid-cols-1 gap-3">
            {question.options!.map((opt) => {
              const selected = answers[question.id as keyof QuizAnswers] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSingleSelect(question.id as keyof QuizAnswers, opt.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                    selected
                      ? 'border-green-700 bg-green-50 text-green-900'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
            {step > 1 && (
              <button onClick={handleBack} className="mt-2 text-stone-500 text-sm underline text-left">← Back</button>
            )}
          </div>
        )}

        {/* DATE PICKER */}
        {question.type === 'date' && (
          <>
            <input
              type="date"
              value={answers.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setAnswers((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full border-2 border-stone-200 rounded-xl p-4 text-lg focus:outline-none focus:border-green-600"
            />
            <div className="mt-6 flex gap-3">
              <button onClick={handleBack} className="px-5 py-3 rounded-xl border-2 border-stone-200 font-semibold hover:border-stone-400 transition-colors">← Back</button>
              <button
                onClick={handleNext}
                disabled={!answers.startDate}
                className="flex-1 py-3 rounded-xl bg-green-800 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* SCALE */}
        {question.type === 'scale' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {question.scaleLabels!.map((label, i) => {
                const value = i + 1;
                const currentValue = answers[question.id as keyof QuizAnswers] as number;
                const selected = currentValue === value;
                return (
                  <button
                    key={label}
                    onClick={() => handleScale(question.id as keyof QuizAnswers, value)}
                    className={`p-4 rounded-xl border-2 font-medium transition-colors ${
                      selected
                        ? 'border-green-700 bg-green-50 text-green-900'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button onClick={handleBack} className="mt-4 text-stone-500 text-sm underline">← Back</button>
          </>
        )}

        {/* YES / NO */}
        {question.type === 'yes-no' && (
          <>
            <div className="flex gap-3 mb-4">
              {[
                { label: 'Yes, kids are coming 👨‍👩‍👧', value: true },
                { label: 'No, just adults 🧑', value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => handleYesNo(question.id as keyof QuizAnswers, opt.value)}
                  className={`flex-1 p-4 rounded-xl border-2 font-medium transition-colors text-left ${
                    answers.hasKids === opt.value
                      ? 'border-green-700 bg-green-50 text-green-900'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {answers.hasKids && (
              <>
                <label className="block font-semibold mb-2">How old are the kids?</label>
                <input
                  type="text"
                  value={answers.kidsAges}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, kidsAges: e.target.value }))}
                  placeholder="e.g. 8 and 12 years old"
                  className="w-full border-2 border-stone-200 rounded-xl p-4 focus:outline-none focus:border-green-600 mb-4"
                />
                <button
                  onClick={handleNext}
                  disabled={!answers.kidsAges}
                  className="w-full py-3 rounded-xl bg-green-800 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </>
            )}

            <button onClick={handleBack} className="mt-4 text-stone-500 text-sm underline">← Back</button>
          </>
        )}

      </div>
    </main>
  );
}
