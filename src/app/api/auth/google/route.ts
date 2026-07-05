import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import {
  findUserByGoogleId, findUserByEmail, createGoogleUser, linkGoogleId,
} from '@/lib/users';
import {
  verifyGoogleIdToken, createSessionToken, sessionCookieOptions,
  isAuthConfigured, SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, welcomeEmail, adminSignupNotificationEmail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? 'web3.payapress@gmail.com, web1.payapress@gmail.com')
  .split(',').map(e => e.trim()).filter(Boolean);

// Sign in / sign up with Google. The client sends the ID token (credential)
// from Google Identity Services; we verify it server-side against Google's
// public keys, then find / link / create the local account and issue our
// own session cookie.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`google:${ip}`, 20, 5 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  if (!isDbConfigured() || !isAuthConfigured()) {
    return NextResponse.json({ error: 'Sign-in is not available right now.' }, { status: 503 });
  }

  let body: { credential?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const claims = await verifyGoogleIdToken(body.credential ?? '');
  if (!claims) {
    return NextResponse.json({ error: 'Google sign-in failed. Please try again.' }, { status: 401 });
  }
  if (!claims.emailVerified) {
    return NextResponse.json(
      { error: 'Your Google email is not verified.' }, { status: 403 },
    );
  }

  try {
    // 1) Existing Google user → log in.
    let user = await findUserByGoogleId(claims.sub);
    let isNewUser = false;

    if (!user) {
      // 2) Existing email/password account → link Google to it.
      const byEmail = await findUserByEmail(claims.email);
      if (byEmail) {
        await linkGoogleId(byEmail.id, claims.sub);
        user = byEmail;
      } else {
        // 3) Brand-new account.
        const uid = await createGoogleUser(
          claims.email, claims.sub, claims.givenName, claims.familyName,
        );
        user = { id: uid, email: claims.email, password_hash: null, opt_in: 0, google_id: claims.sub };
        isNewUser = true;
      }
    }

    const token = await createSessionToken({ uid: user.id, email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(true));

    // Welcome + admin notification for genuinely new accounts. Awaited
    // (capped at 8s): Passenger freezes the process once the response is
    // sent, so un-awaited sends never go out. Failures never block login.
    if (isNewUser) {
      const w = welcomeEmail(user.email);
      const notify = adminSignupNotificationEmail({
        email: user.email, uid: user.id, userNumber: null,
        ip, location: 'via Google Sign-In',
        userAgent: req.headers.get('user-agent') ?? '',
        page: req.headers.get('referer') ?? '', optIn: false,
        time: new Date().toISOString(),
      });
      const mailWork = Promise.allSettled([
        sendMail({ to: user.email, subject: w.subject, html: w.html, text: w.text })
          .catch(err => console.error('[auth/google] welcome email failed:', err)),
        ...ADMIN_EMAILS.map(to =>
          sendMail({ to, subject: `${notify.subject} (Google)`, html: notify.html, text: notify.text })
            .catch(err => console.error(`[auth/google] admin notify ${to} failed:`, err)),
        ),
      ]);
      await Promise.race([mailWork, new Promise(r => setTimeout(r, 8000))]);
    }

    return res;
  } catch (err) {
    console.error('[auth/google]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
