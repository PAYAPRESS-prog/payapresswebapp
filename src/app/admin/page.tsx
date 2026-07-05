import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/adminAuth';
import { AdminGate } from '@/components/admin/AdminGate';
import { AdminShell } from '@/components/admin/AdminShell';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// /admin — Busbar Admin back-office.
// Without a valid admin cookie this renders a page indistinguishable
// from the site's 404 (the gate). The gate's bare input exchanges
// ADMIN_KEY for the session cookie; nothing on the page hints at it.
export default async function AdminPage() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const authed = token ? await verifyAdminToken(token) : false;
  return authed ? <AdminShell /> : <AdminGate />;
}
