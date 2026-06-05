import { NextResponse } from 'next/server';
import { sendMail, isMailerConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');

  const config = {
    configured: isMailerConfigured(),
    SMTP_HOST: process.env.SMTP_HOST ?? '(not set)',
    SMTP_PORT: process.env.SMTP_PORT ?? '(not set)',
    SMTP_USER: process.env.SMTP_USER ?? '(not set)',
    SMTP_PASS: process.env.SMTP_PASS ? '(set)' : '(not set)',
  };

  if (!to) {
    return NextResponse.json({ config, error: 'Add ?to=your@email.com to send a test' });
  }

  try {
    await sendMail({
      to,
      subject: 'SMTP Test — Busbar Calculator',
      html: '<p>SMTP is working correctly.</p>',
      text: 'SMTP is working correctly.',
    });
    return NextResponse.json({ ok: true, config, sent_to: to });
  } catch (err) {
    return NextResponse.json({ ok: false, config, error: String(err) }, { status: 500 });
  }
}
