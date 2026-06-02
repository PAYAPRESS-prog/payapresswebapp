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

// Runs in Node.js runtime (custom server.js on Hostinger) — needs mysql2/bcrypt.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

    const res = NextResponse.json({ ok: true, user: { id: uid, email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/signup]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
