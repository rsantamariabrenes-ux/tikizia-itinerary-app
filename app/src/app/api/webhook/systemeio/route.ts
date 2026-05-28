import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY!);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const WEBHOOK_SECRET = process.env.SYSTEMEIO_WEBHOOK_SECRET!;

if (!WEBHOOK_SECRET) {
  throw new Error('SYSTEMEIO_WEBHOOK_SECRET environment variable is not set');
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const email: string | undefined =
    body.email ??
    body.contact?.email ??
    body.order?.contact?.email;

  if (!email) {
    return NextResponse.json({ error: 'No email found in payload' }, { status: 400 });
  }

  const token = randomUUID();

  const { error: dbError } = await supabase.from('access_tokens').insert({
    email,
    token,
    generations_remaining: 5,
  });

  if (dbError) {
    console.error('DB insert error:', dbError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const accessUrl = `${APP_URL}/access/${token}`;

  try {
    const { error: emailError } = await resend.emails.send({
      from: 'Explore TikiZia <itinerary@exploretikizia.com>',
      to: email,
      subject: 'Your Costa Rica Itinerary Generator Is Ready 🌿',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="color:#2D6A4F">Your Costa Rica adventure starts here</h1>
  <p>Thank you for your purchase! Your personalized itinerary generator is ready.</p>
  <p>You have <strong>5 itinerary generations</strong> included. Each one is fully customized to your travel style — and you can adjust and regenerate as many times as you like within those 5.</p>
  <p style="margin:32px 0">
    <a href="${accessUrl}"
       style="background:#2D6A4F;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block">
      Build My Itinerary →
    </a>
  </p>
  <p style="color:#666;font-size:13px">
    This link is personal to you — it's your access key. Keep it safe.<br>
    Questions? Reply to this email and Rod will get back to you.
  </p>
  <p style="color:#666;font-size:13px">— Rodrigo & the Explore TikiZia team</p>
</body>
</html>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
    }
  } catch (err) {
    console.error('Resend exception:', err);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
