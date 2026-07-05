import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserByEmail } from '@/lib/users';
import {
  verifyPassword,
  createSessionToken,
  sessionCookieOptions,
  isValidEmail,
  isAuthConfigured,
  SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Rate limit: 10 attempts per IP per minute to slow brute-force attacks.
  const ip = getClientIp(req);
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Login is not available yet. Database not configured.' },
      { status: 503 },
    );
  }
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Login is not available yet. Server auth secret not configured.' },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email    = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const remember = Boolean(body.remember);

  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email.', code: 'not_found' },
        { status: 404 },
      );
    }
    // Google-only account (no password set) — guide the user to the right button.
    if (!user.password_hash && user.google_id) {
      return NextResponse.json(
        { error: 'This account uses Google Sign-In. Please continue with Google.' },
        { status: 409 },
      );
    }
    if (!(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const token = await createSessionToken({ uid: user.id, email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(remember));
    return res;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
