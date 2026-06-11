import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { listHistory, saveHistory, deleteHistory, reorderHistory } from '@/lib/history';

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
  const { name, metal, width, thickness, length, price, currency } = body;
  if (!metal || !width || !thickness || !length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Reject non-numeric dimensions — NaN would fail the INT columns with a 500.
  if (![width, thickness, length].every(v => Number.isFinite(Number(v)) && Number(v) > 0)) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 });
  }
  if (metal !== 'copper' && metal !== 'aluminum') {
    return NextResponse.json({ error: 'Invalid metal' }, { status: 400 });
  }
  const cleanName = String(name ?? '').trim().slice(0, 120) || 'Untitled';
  const cleanPrice = price != null && !Number.isNaN(Number(price)) ? Number(price) : null;
  const cleanCurrency = currency ? String(currency).trim().slice(0, 10) : null;
  const id = await saveHistory(
    user.uid, cleanName, metal,
    Number(width), Number(thickness), Number(length),
    cleanPrice, cleanCurrency,
  );
  return NextResponse.json({ id });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { order } = await req.json().catch(() => ({}));
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'Missing order' }, { status: 400 });
  }
  await reorderHistory(user.uid, order.map(Number).filter(n => !Number.isNaN(n)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteHistory(user.uid, Number(id));
  return NextResponse.json({ ok: true });
}
