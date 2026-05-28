import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateItinerary } from '@/lib/claude';
import { QuizAnswers } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as { token: string; answers: QuizAnswers };
  const { token, answers } = body;

  if (!token || !answers) {
    return NextResponse.json({ error: 'Missing token or answers' }, { status: 400 });
  }

  // Atomic decrement: only decrements if generations_remaining > 0
  // Returns the new count, or empty array if token not found or count was already 0
  const { data, error } = await supabase.rpc('decrement_generation', { p_token: token });

  if (error) {
    console.error('Decrement RPC error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    // Token not found OR generations_remaining was already 0
    return NextResponse.json({ error: 'No generations remaining or invalid token' }, { status: 403 });
  }

  const newCount: number = data[0].generations_remaining;

  const html = await generateItinerary(answers);

  return NextResponse.json({ html, generationsRemaining: newCount });
}
