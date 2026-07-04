import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserByEmail, createUser } from '@/lib/users';
import {
  verifySignupToken,
  createSessionToken,
  sessionCookieOptions,
  isAuthConfigured,
  SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, welcomeEmail } from '@/lib/mailer';
import { createHash, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Second signup step: the user proves inbox ownership by entering the
// 6-digit code we emailed. The pending signup travels in the signed
// token issued by /api/auth/signup — only a matching code creates the
// account and starts the session.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`signup-verify:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Sign-up is not available right now.' },
      { status: 503 },
    );
  }

  let body: { token?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const code = (body.code ?? '').trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 });
  }

  const pending = await verifySignupToken(body.token ?? '');
  if (!pending) {
    return NextResponse.json(
      { error: 'This code has expired. Please sign up again to get a new one.' },
      { status: 401 },
    );
  }

  const givenHash = createHash('sha256').update(code).digest();
  const wantHash  = Buffer.from(pending.codeHash, 'hex');
  if (givenHash.length !== wantHash.length || !timingSafeEqual(givenHash, wantHash)) {
    return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 401 });
  }

  try {
    // The address may have registered elsewhere while the code was pending.
    const existing = await findUserByEmail(pending.email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const uid = await createUser(pending.email, pending.ph, pending.optIn);
    const session = await createSessionToken({ uid, email: pending.email });

    const w = welcomeEmail(pending.email);
    sendMail({ to: pending.email, subject: w.subject, html: w.html, text: w.text })
      .catch(err => console.error('[signup/verify] welcome email failed:', err));

    const res = NextResponse.json({ ok: true, user: { id: uid, email: pending.email } });
    res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/signup/verify]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
