import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserByEmail } from '@/lib/users';
import { createResetToken, isValidEmail, isAuthConfigured } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, resetPasswordEmail, isMailerConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://calculator.payapress.com';

export async function POST(req: Request) {
  // 3 reset requests per IP per 15 minutes — stops both abuse and
  // accidental double-taps flooding the inbox.
  const ip = getClientIp(req);
  if (!checkRateLimit(`forgot:${ip}`, 3, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured() || !isAuthConfigured() || !isMailerConfigured()) {
    return NextResponse.json(
      { error: 'Password reset is not available right now.' },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    // Always respond OK — a different answer for unknown emails would let
    // anyone probe which addresses have accounts (email enumeration).
    if (user) {
      const token = await createResetToken({ uid: user.id, email: user.email });
      const resetUrl = `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
      const mail = resetPasswordEmail(user.email, resetUrl);
      sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text })
        .catch(err => console.error('[auth/forgot] reset email failed:', err));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/forgot]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
