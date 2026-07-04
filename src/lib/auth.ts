// Auth helpers — password hashing (bcrypt) + JWT session tokens (jose).
// JWT is stored in an httpOnly cookie so it can't be read by client JS.

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

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
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
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
    const { payload } = await jwtVerify(token, getSecret());
    return { uid: Number(payload.sub), email: String(payload.email) };
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
