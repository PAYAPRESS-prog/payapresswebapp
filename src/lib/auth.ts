// Auth helpers — password hashing (bcrypt) + JWT session tokens (jose).
// JWT is stored in an httpOnly cookie so it can't be read by client JS.

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';

export const SESSION_COOKIE = 'pp_session';
const SESSION_DAYS = 30;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    // Fail loudly in production if the secret is missing/weak.
    throw new Error('JWT_SECRET env var is missing or too short (need ≥16 chars).');
  }
  return new TextEncoder().encode(secret);
}

// Routes call this before doing any work so a missing JWT_SECRET surfaces as
// a clear 503 instead of a generic 500 after the DB round-trip.
export function isAuthConfigured(): boolean {
  const secret = process.env.JWT_SECRET;
  return Boolean(secret && secret.length >= 16);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  // A Google-only account has no password hash — never authenticate it
  // via password (bcrypt.compare on a null hash would throw).
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// ── Google Sign-In: verify the ID token from Google Identity Services ──
// Validates the RS256 signature against Google's rotating public keys and
// checks issuer + audience + email_verified. Returns the trusted claims
// or null. No secret needed — this is public-key verification.
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);

export type GoogleClaims = {
  sub: string;          // stable Google user id
  email: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleClaims | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
      algorithms: ['RS256'],
    });
    const email = String(payload.email ?? '').toLowerCase();
    const sub = String(payload.sub ?? '');
    if (!email || !sub) return null;
    return {
      sub,
      email,
      emailVerified: payload.email_verified === true,
      givenName:  payload.given_name  ? String(payload.given_name)  : undefined,
      familyName: payload.family_name ? String(payload.family_name) : undefined,
    };
  } catch {
    return null;
  }
}

// ── Sign in with Apple: verify the identity token ──────────────────
// Same public-key model as Google. Audience differs by surface:
//   - native app (AuthenticationServices):  aud = bundle id
//   - web (Sign in with Apple JS):          aud = Services ID (APPLE_CLIENT_ID)
const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
);
const APPLE_BUNDLE_ID = 'com.payapress.calculator';

export type AppleClaims = {
  sub: string;            // stable per-team Apple user id
  email: string;          // may be a privaterelay.appleid.com address
  emailVerified: boolean;
  isPrivateEmail: boolean;
};

export async function verifyAppleIdToken(idToken: string): Promise<AppleClaims | null> {
  const audiences = [
    APPLE_BUNDLE_ID,
    process.env.APPLE_CLIENT_ID ?? '',
    process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? '',
  ].filter(Boolean);
  try {
    const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: audiences,
      algorithms: ['RS256'],
    });
    const sub = String(payload.sub ?? '');
    const email = String(payload.email ?? '').toLowerCase();
    if (!sub || !email) return null;
    // Apple encodes booleans as true OR the string "true".
    const truthy = (v: unknown) => v === true || v === 'true';
    return {
      sub,
      email,
      emailVerified: truthy(payload.email_verified),
      isPrivateEmail: truthy(payload.is_private_email),
    };
  } catch {
    return null;
  }
}

export type SessionPayload = { uid: number; email: string };

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.uid))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    const uid = Number(payload.sub);
    if (!Number.isInteger(uid) || uid <= 0) return null;
    return { uid, email: String(payload.email) };
  } catch {
    return null;
  }
}

// ── Password-reset tokens ─────────────────────────────────────────
// Short-lived JWT with an explicit purpose claim so a reset token can
// never be replayed as a session token (and vice versa).

export async function createResetToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, purpose: 'pwreset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.uid))
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(getSecret());
}

export async function verifyResetToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== 'pwreset') return null;
    return { uid: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

// ── Signup email-verification tokens ─────────────────────────────
// The pending signup (email + bcrypt hash + code hash) travels in a
// signed short-lived JWT so no server-side OTP table is needed. The
// purpose claim keeps it unusable as a session or reset token.

export type SignupPendingPayload = {
  email: string;
  ph: string;       // bcrypt password hash
  optIn: boolean;
  codeHash: string; // sha256 of the 6-digit code
};

export async function createSignupToken(p: SignupPendingPayload): Promise<string> {
  return new SignJWT({ ...p, purpose: 'signup-otp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifySignupToken(token: string): Promise<SignupPendingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'signup-otp') return null;
    return {
      email: String(payload.email),
      ph: String(payload.ph),
      optIn: Boolean(payload.optIn),
      codeHash: String(payload.codeHash),
    };
  } catch {
    return null;
  }
}

// Cookie options for the session token.
export function sessionCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    // "Remember me" → 30 days; otherwise a session cookie (no maxAge).
    ...(remember ? { maxAge: SESSION_DAYS * 24 * 60 * 60 } : {}),
  };
}

// Basic email shape check — good enough for signup validation.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
