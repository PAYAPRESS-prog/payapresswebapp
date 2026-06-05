import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserByEmail, createUser } from '@/lib/users';
import {
  hashPassword,
  createSessionToken,
  sessionCookieOptions,
  isValidEmail,
  SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, welcomeEmail } from '@/lib/mailer';

// Runs in Node.js runtime (custom server.js on Hostinger) — needs mysql2/bcrypt.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`signup:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Sign-up is not available yet. Database not configured.' },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string; optIn?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const optIn = Boolean(body.optIn);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters.' },
      { status: 400 },
    );
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const uid = await createUser(email, passwordHash, optIn);
    const token = await createSessionToken({ uid, email });

    // Fire-and-forget welcome email — don't block the signup response.
    const w = welcomeEmail(email);
    sendMail({ to: email, subject: w.subject, html: w.html, text: w.text, category: 'transactional' })
      .catch(err => console.error('[signup] welcome email failed:', err));

    const res = NextResponse.json({ ok: true, user: { id: uid, email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/signup]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
