import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import {
  findUserByAppleSub, findUserByEmail, createAppleUser, linkAppleSub,
} from '@/lib/users';
import {
  verifyAppleIdToken, createSessionToken, sessionCookieOptions,
  isAuthConfigured, SESSION_COOKIE,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, welcomeEmail, adminSignupNotificationEmail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? 'web3.payapress@gmail.com, web1.payapress@gmail.com')
  .split(',').map(e => e.trim()).filter(Boolean);

// Sign in / sign up with Apple. The client sends the identity token from
// either the native AuthenticationServices sheet (iOS shell) or the
// Sign in with Apple JS web flow; we verify it server-side against Apple's
// public keys, then find / link / create the local account and issue our
// own session cookie. Apple only sends name/email on the FIRST auth, so the
// optional name fields are persisted immediately when present.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`apple:${ip}`, 20, 5 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  if (!isDbConfigured() || !isAuthConfigured()) {
    return NextResponse.json({ error: 'Sign-in is not available right now.' }, { status: 503 });
  }

  let body: { identityToken?: string; givenName?: string; familyName?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const claims = await verifyAppleIdToken(body.identityToken ?? '');
  if (!claims) {
    return NextResponse.json({ error: 'Apple sign-in failed. Please try again.' }, { status: 401 });
  }
  // Apple emails (incl. Hide-My-Email relays) are verified by Apple; the
  // claim is present on every token — reject only an explicit false.
  if (!claims.emailVerified) {
    return NextResponse.json({ error: 'Your Apple email is not verified.' }, { status: 403 });
  }

  try {
    // 1) Existing Apple user → log in.
    let user = await findUserByAppleSub(claims.sub);
    let isNewUser = false;

    if (!user) {
      // 2) Existing account with the same email → link Apple to it.
      //    (Hide-My-Email relays simply behave as first-class emails here.)
      const byEmail = await findUserByEmail(claims.email);
      if (byEmail) {
        await linkAppleSub(byEmail.id, claims.sub);
        user = byEmail;
      } else {
        // 3) Brand-new account.
        const uid = await createAppleUser(
          claims.email, claims.sub,
          body.givenName?.slice(0, 100), body.familyName?.slice(0, 100),
        );
        user = { id: uid, email: claims.email, password_hash: null, opt_in: 0 };
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
        ip, location: 'via Sign in with Apple',
        userAgent: req.headers.get('user-agent') ?? '',
        page: req.headers.get('referer') ?? '', optIn: false,
        time: new Date().toISOString(),
      });
      const mailWork = Promise.allSettled([
        sendMail({ to: user.email, subject: w.subject, html: w.html, text: w.text })
          .catch(err => console.error('[auth/apple] welcome email failed:', err)),
        ...ADMIN_EMAILS.map(to =>
          sendMail({ to, subject: `${notify.subject} (Apple)`, html: notify.html, text: notify.text })
            .catch(err => console.error(`[auth/apple] admin notify ${to} failed:`, err)),
        ),
      ]);
      await Promise.race([mailWork, new Promise(r => setTimeout(r, 8000))]);
    }

    return res;
  } catch (err) {
    console.error('[auth/apple]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
