import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE, adminCookieOptions, adminKeyConfigured, adminKeyMatches,
  createAdminToken, audit,
} from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Exchange ADMIN_KEY for a 12h admin session cookie.
// Wrong key → opaque 404, identical to a route that does not exist.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`admin-login:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  let body: { key?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!adminKeyConfigured() || !adminKeyMatches(body.key ?? '')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const token = await createAdminToken();
  await audit('login', 'admin panel', ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 });
  await audit('logout', 'admin panel', getClientIp(req));
  return res;
}
