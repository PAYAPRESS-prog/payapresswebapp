import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE, verifyPassword, hashPassword } from '@/lib/auth';
import { findUserById, updatePasswordHash } from '@/lib/users';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Without this an authenticated session could brute-force the current
  // password through unlimited attempts.
  const ip = getClientIp(req);
  if (!checkRateLimit(`chpw:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute.' },
      { status: 429 },
    );
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { current_password, new_password } = body;

  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }
  if (String(new_password).length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
  }

  const user = await findUserById(session.uid);
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const ok = await verifyPassword(String(current_password), user.password_hash);
  if (!ok) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });

  const newHash = await hashPassword(String(new_password));
  await updatePasswordHash(session.uid, newHash);
  return NextResponse.json({ ok: true });
}
