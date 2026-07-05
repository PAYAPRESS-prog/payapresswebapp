import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, audit } from '@/lib/adminAuth';
import { getPool, isDbConfigured } from '@/lib/db';
import { archiveAndDeleteUser } from '@/lib/users';
import { sendMail, announcementEmail, isMailerConfigured } from '@/lib/mailer';
import { getClientIp } from '@/lib/rateLimit';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Users CRM: list (search + page), detail (?id=), actions via POST,
// archive-and-delete via DELETE. Every write is audited.

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const p = req.nextUrl.searchParams;
  const pool = getPool();

  try {
    const id = parseInt(p.get('id') ?? '', 10);
    if (Number.isInteger(id) && id > 0) {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, google_id IS NOT NULL AS is_google,
                password_hash IS NOT NULL AS has_password,
                opt_in, created_at, first_name, last_name, company, phone
         FROM users WHERE id = ? LIMIT 1`, [id]);
      if (!users[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const email = String(users[0].email);
      const [history] = await pool.query<RowDataPacket[]>(
        `SELECT name, metal, width, thickness, length, price, currency, created_at
         FROM busbar_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [id])
        .catch(() => [[] as RowDataPacket[]] as never);
      const [subs] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM email_subscriptions WHERE email = ? LIMIT 1', [email])
        .catch(() => [[] as RowDataPacket[]] as never);
      return NextResponse.json({ user: users[0], history, subscribed: subs.length > 0 });
    }

    // Paged list
    const page = Math.max(1, parseInt(p.get('page') ?? '1', 10) || 1);
    const per = 25;
    const q = (p.get('q') ?? '').slice(0, 120);
    const whereSql = q ? 'WHERE u.email LIKE ?' : '';
    const args: unknown[] = q ? [`%${q}%`] : [];
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) c FROM users u ${whereSql}`, args);
    const total = Number(countRows[0]?.c) || 0;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.google_id IS NOT NULL AS is_google,
              u.opt_in, u.created_at,
              (SELECT COUNT(*) FROM busbar_history h WHERE h.user_id = u.id) AS saves,
              (SELECT MAX(h.created_at) FROM busbar_history h WHERE h.user_id = u.id) AS last_save,
              EXISTS(SELECT 1 FROM email_subscriptions s WHERE s.email = u.email) AS subscribed
       FROM users u ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT ${per} OFFSET ${(page - 1) * per}`, args);

    // Side lists (first page only, to keep the payload lean)
    let deleted: RowDataPacket[] = [];
    let subscribers: RowDataPacket[] = [];
    if (page === 1 && !q) {
      [deleted] = await pool.query<RowDataPacket[]>(
        `SELECT original_uid, email, history_count, registered_at, deleted_at
         FROM deleted_accounts ORDER BY deleted_at DESC LIMIT 100`)
        .catch(() => [[] as RowDataPacket[]] as never);
      [subscribers] = await pool.query<RowDataPacket[]>(
        `SELECT email, created_at FROM email_subscriptions
         ORDER BY created_at DESC LIMIT 200`)
        .catch(() => [[] as RowDataPacket[]] as never);
    }
    return NextResponse.json({ rows, total, page, per, deleted, subscribers });
  } catch (err) {
    console.error('[admin/crm]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const ip = getClientIp(req);
  let body: { action?: string; id?: number; email?: string; subject?: string; message?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    if (body.action === 'email') {
      if (!isMailerConfigured()) {
        return NextResponse.json({ error: 'SMTP is not configured' }, { status: 503 });
      }
      const to = (body.email ?? '').trim();
      const subject = (body.subject ?? '').trim().slice(0, 160);
      const message = (body.message ?? '').trim().slice(0, 8000);
      if (!to || !subject || !message) {
        return NextResponse.json({ error: 'Recipient, subject and message are required' }, { status: 400 });
      }
      const mail = announcementEmail(subject, message);
      await sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text });
      await audit('email-user', to, ip);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'toggle-sub') {
      const email = (body.email ?? '').trim().toLowerCase();
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
      const pool = getPool();
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM email_subscriptions WHERE email = ? LIMIT 1', [email]);
      if (existing.length > 0) {
        await pool.query('DELETE FROM email_subscriptions WHERE email = ?', [email]);
        await audit('unsubscribe', email, ip);
        return NextResponse.json({ ok: true, subscribed: false });
      }
      await pool.query('INSERT IGNORE INTO email_subscriptions (email) VALUES (?)', [email]);
      await audit('subscribe', email, ip);
      return NextResponse.json({ ok: true, subscribed: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[admin/crm POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const id = parseInt(req.nextUrl.searchParams.get('id') ?? '', 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const ip = getClientIp(req);
  try {
    await archiveAndDeleteUser(id, {
      ip, userAgent: `admin-panel (${req.headers.get('user-agent') ?? ''})`.slice(0, 250),
    });
    await audit('delete-user', `uid ${id}`, ip);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/crm DELETE]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
