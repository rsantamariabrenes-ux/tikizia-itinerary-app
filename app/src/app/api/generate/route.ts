import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { streamItinerary } from '@/lib/claude';
import { QuizAnswers } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as { token: string; answers: QuizAnswers };
  const { token, answers } = body;

  if (!token || !answers) {
    return new Response(JSON.stringify({ error: 'Missing token or answers' }), { status: 400 });
  }

  const { data, error } = await supabase.rpc('decrement_generation', { p_token: token });

  if (error) {
    return new Response(JSON.stringify({ error: 'Database error', debug: error.message }), { status: 500 });
  }

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ error: 'No generations remaining or invalid token' }), { status: 403 });
  }

  const newCount: number = data[0].generations_remaining;
  const stream = streamItinerary(answers);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Generations-Remaining': String(newCount),
      'Cache-Control': 'no-cache',
    },
  });
}
