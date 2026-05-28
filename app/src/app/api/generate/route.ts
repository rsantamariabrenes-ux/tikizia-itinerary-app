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

  const { data, error } = await supabase
    .from('access_tokens')
    .select('generations_remaining')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
  }

  if (data.generations_remaining <= 0) {
    return NextResponse.json({ error: 'No generations remaining' }, { status: 403 });
  }

  const newCount = data.generations_remaining - 1;
  await supabase
    .from('access_tokens')
    .update({ generations_remaining: newCount, last_used_at: new Date().toISOString() })
    .eq('token', token);

  const html = await generateItinerary(answers);

  return NextResponse.json({ html, generationsRemaining: newCount });
}
