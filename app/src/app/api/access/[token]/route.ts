import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { data, error } = await supabase
    .from('access_tokens')
    .select('token, generations_remaining, email')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    generationsRemaining: data.generations_remaining,
    email: data.email,
  });
}
