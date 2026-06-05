import { NextResponse } from 'next/server';
import { sendMail, isMailerConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');

  const config = {
    configured: isMailerConfigured(),
    SMTP_HOST:  process.env.SMTP_HOST  ?? '(not set)',
    SMTP_PORT:  process.env.SMTP_PORT  ?? '(not set)',
    SMTP_USER:  process.env.SMTP_USER  ?? '(not set)',
    SMTP_PASS:  process.env.SMTP_PASS  ? '(set)' : '(not set)',
  };

  if (!to) {
    return NextResponse.json({ config, usage: 'Add ?to=your@email.com to send a test email' });
  }

  try {
    await sendMail({
      to,
      subject: 'Delivery Test — Busbar Calculator',
      category: 'transactional',
      html: `<div style="font-family:Arial,sans-serif;padding:20px">
               <h2 style="color:#cd7f32">Email delivery test</h2>
               <p>If you received this, SMTP is working correctly.</p>
               <p style="color:#888;font-size:12px">Sent at ${new Date().toISOString()}</p>
             </div>`,
      text: `Email delivery test\n\nIf you received this, SMTP is working correctly.\n\nSent at ${new Date().toISOString()}`,
    });
    return NextResponse.json({ ok: true, config, sent_to: to, time: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, config, error: String(err) }, { status: 500 });
  }
}
