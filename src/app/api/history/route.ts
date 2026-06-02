import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { listHistory, saveHistory, deleteHistory } from '@/lib/history';

async function getUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await listHistory(user.uid);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { metal, width, thickness, length } = body;
  if (!metal || !width || !thickness || !length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const id = await saveHistory(user.uid, metal, Number(width), Number(thickness), Number(length));
  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteHistory(user.uid, Number(id));
  return NextResponse.json({ ok: true });
}
