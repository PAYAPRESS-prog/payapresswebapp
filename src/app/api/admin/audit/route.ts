import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAudit } from '@/lib/adminAuth';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  try {
    const action = req.nextUrl.searchParams.get('action');
    const rows = await getAudit(action && action.length <= 64 ? action : null, 200);
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('[admin/audit]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
