import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDbConfigured } from '@/lib/db';
import { findUserById, archiveAndDeleteUser } from '@/lib/users';
import { verifySessionToken, verifyPassword, SESSION_COOKIE } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Permanent account deletion. Requires the current password so a stolen
// session alone can't destroy the account. Operational data is removed;
// a minimal audit record is archived (see users.archiveAndDeleteUser).
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`account-delete:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Not available right now.' }, { status: 503 });
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!body.password) {
    return NextResponse.json({ error: 'Please enter your password.' }, { status: 400 });
  }

  try {
    const user = await findUserById(session.uid);
    if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const ok = await verifyPassword(String(body.password), user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    await archiveAndDeleteUser(session.uid, {
      ip,
      userAgent: req.headers.get('user-agent') ?? '',
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  } catch (err) {
    console.error('[account/delete]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
