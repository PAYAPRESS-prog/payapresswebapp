import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { findUserById, updatePasswordHash } from '@/lib/users';
import {
  verifyResetToken,
  hashPassword,
  createSessionToken,
  sessionCookieOptions,
  isAuthConfigured,
  SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`reset:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Password reset is not available right now.' },
      { status: 503 },
    );
  }

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const token = body.token ?? '';
  const password = body.password ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Missing reset token.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const session = await verifyResetToken(token);
  if (!session) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 401 },
    );
  }

  try {
    const user = await findUserById(session.uid);
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    const newHash = await hashPassword(password);
    await updatePasswordHash(user.id, newHash);

    // Log the user straight in — they just proved email ownership.
    const sessionToken = await createSessionToken({ uid: user.id, email: user.email });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/reset]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
