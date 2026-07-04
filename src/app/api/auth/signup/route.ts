import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserByEmail, createUser } from '@/lib/users';
import {
  hashPassword,
  createSessionToken,
  createSignupToken,
  sessionCookieOptions,
  isValidEmail,
  isAuthConfigured,
  SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, welcomeEmail, verifyCodeEmail, isMailerConfigured } from '@/lib/mailer';
import { createHash, randomInt } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Rate limit: 5 sign-up attempts per IP per 5 minutes.
  const ip = getClientIp(req);
  if (!checkRateLimit(`signup:${ip}`, 5, 5 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Sign-up is not available yet. Database not configured.' },
      { status: 503 },
    );
  }
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Sign-up is not available yet. Server auth secret not configured.' },
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
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
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

    // ── Email verification step ──────────────────────────────────
    // The account is only created after the user proves inbox
    // ownership with a 6-digit code (see signup/verify). If SMTP is
    // not configured (local dev), fall back to direct creation so
    // signup never hard-blocks on mail infrastructure.
    if (isMailerConfigured()) {
      const code = String(randomInt(100000, 1000000)); // 6 digits
      const codeHash = createHash('sha256').update(code).digest('hex');
      const pendingToken = await createSignupToken({
        email, ph: passwordHash, optIn, codeHash,
      });

      const v = verifyCodeEmail(email, code);
      await sendMail({ to: email, subject: v.subject, html: v.html, text: v.text });

      return NextResponse.json({ pending: true, token: pendingToken });
    }

    const uid = await createUser(email, passwordHash, optIn);
    const token = await createSessionToken({ uid, email });
    const res = NextResponse.json({ ok: true, user: { id: uid, email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/signup]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
