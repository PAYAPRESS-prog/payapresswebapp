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
import { sendMail, welcomeEmail, adminSignupNotificationEmail } from '@/lib/mailer';
import { getPool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { createHash, timingSafeEqual } from 'crypto';

// One or more admin recipients — comma-separated ADMIN_EMAIL env var
// overrides these defaults.
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? 'web3.payapress@gmail.com, web1.payapress@gmail.com')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

// Best-effort IP → location lookup (free, keyless). Never blocks signup.
async function lookupLocation(ip: string): Promise<string> {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('::1')) {
    return 'Unknown (local/proxy IP)';
  }
  try {
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return 'Unknown';
    const d = await r.json();
    if (!d?.success) return 'Unknown';
    const parts = [d.city, d.region, d.country].filter(Boolean).join(', ');
    const isp = d.connection?.isp ? ` · ${d.connection.isp}` : '';
    return parts ? `${parts}${isp}` : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// Admin notification. IMPORTANT: this must be AWAITED before the route
// returns — Hostinger's Passenger process manager freezes the app once the
// response is sent, so fire-and-forget sends silently die. A failure here
// must still never affect the user's signup (all errors are swallowed).
async function notifyAdmin(info: {
  email: string; uid: number; ip: string; userAgent: string;
  page: string; optIn: boolean;
}): Promise<void> {
  try {
    let userNumber: number | null = null;
    try {
      const [rows] = await getPool().query<RowDataPacket[]>('SELECT COUNT(*) AS c FROM users');
      userNumber = Number(rows[0]?.c) || null;
    } catch { /* count is optional */ }
    const location = await lookupLocation(info.ip);
    const mail = adminSignupNotificationEmail({
      ...info, userNumber, location, time: new Date().toISOString(),
    });
    await Promise.all(ADMIN_EMAILS.map(to =>
      sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text })
        .catch(err => console.error(`[signup/verify] admin notify to ${to} failed:`, err)),
    ));
  } catch (err) {
    console.error('[signup/verify] admin notification failed:', err);
  }
}

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

    // Welcome + admin mails run concurrently and are awaited (capped at
    // 8s) — after the response is sent Passenger freezes the process and
    // un-awaited sends never leave the box. Failures never block signup.
    const w = welcomeEmail(pending.email);
    const mailWork = Promise.allSettled([
      sendMail({ to: pending.email, subject: w.subject, html: w.html, text: w.text })
        .catch(err => console.error('[signup/verify] welcome email failed:', err)),
      notifyAdmin({
        email: pending.email,
        uid,
        ip,
        userAgent: req.headers.get('user-agent') ?? '',
        page: req.headers.get('referer') ?? '',
        optIn: pending.optIn,
      }),
    ]);
    await Promise.race([mailWork, new Promise(r => setTimeout(r, 8000))]);

    const res = NextResponse.json({ ok: true, user: { id: uid, email: pending.email } });
    res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(true));
    return res;
  } catch (err) {
    console.error('[auth/signup/verify]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
