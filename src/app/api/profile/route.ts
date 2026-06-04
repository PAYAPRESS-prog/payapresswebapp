import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { findUserById, updateProfile } from '@/lib/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET() {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserById(session.uid);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    id:         user.id,
    email:      user.email,
    first_name: user.first_name ?? '',
    last_name:  user.last_name  ?? '',
    company:    user.company    ?? '',
    phone:      user.phone      ?? '',
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const clean = (v: unknown, max: number) =>
    typeof v === 'string' ? v.trim().slice(0, max) : undefined;

  const fields: Record<string, string> = {};
  const fn = clean(body.first_name, 100);
  const ln = clean(body.last_name,  100);
  const co = clean(body.company,    150);
  const ph = clean(body.phone,       30);
  if (fn !== undefined) fields.first_name = fn;
  if (ln !== undefined) fields.last_name  = ln;
  if (co !== undefined) fields.company    = co;
  if (ph !== undefined) fields.phone      = ph;

  await updateProfile(session.uid, fields);
  return NextResponse.json({ ok: true });
}
