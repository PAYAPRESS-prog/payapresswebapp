import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ── SMTP transport (Hostinger) ────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
    pool: true,
    maxConnections: 3,
    socketTimeout: 12_000,
  });
}

// eslint-disable-next-line
let _transport: nodemailer.Transporter<unknown> | null = null;
function getTransport() {
  if (!_transport) _transport = createTransport();
  return _transport;
}

export function isMailerConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

const FROM_ADDR = () =>
  process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'info@calculator.payapress.com';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://calculator.payapress.com';

// ── Send helper ───────────────────────────────────────────────────────────────

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * 'transactional' = user-triggered (welcome, confirm) — no bulk headers.
   * 'bulk'          = newsletter / mass send — adds Precedence + unsubscribe.
   * Default: 'transactional'
   */
  category?: 'transactional' | 'bulk';
  listUnsubscribe?: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn('[mailer] SMTP not configured — skipping email to', opts.to);
    return;
  }

  const from    = FROM_ADDR();
  const domain  = from.split('@')[1] ?? 'calculator.payapress.com';
  const msgId   = `<${crypto.randomUUID()}@${domain}>`;
  const isBulk  = opts.category === 'bulk';
  const unsubUrl = opts.listUnsubscribe ?? `<mailto:${from}?subject=unsubscribe>`;

  const extraHeaders: Record<string, string> = {
    'X-Mailer':        'Busbar-Calculator-Mailer/1.0',
    'List-Unsubscribe': unsubUrl,
  };

  if (isBulk) {
    extraHeaders['Precedence']            = 'bulk';
    extraHeaders['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  } else {
    // Transactional — triggered by user action.
    // Precedence:bulk tells Gmail to route to Spam/Promotions, so we omit it.
    extraHeaders['Auto-Submitted'] = 'auto-generated';
  }

  await transport.sendMail({
    from:      `"Busbar Calculator" <${from}>`,
    replyTo:   from,
    to:        opts.to,
    subject:   opts.subject,
    messageId: msgId,
    html:      opts.html,
    text:      opts.text,
    headers:   extraHeaders,
  });
}

// ── Templates ─────────────────────────────────────────────────────────────────

function baseLayout(content: string, unsubLine: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Busbar Calculator</title>
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}
  .outer{background:#f4f4f5;padding:32px 16px;}
  .wrap{max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#0c0c0f;padding:24px 28px 20px;}
  .header-logo{font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
               color:#cd7f32;}
  .body{padding:28px 28px 24px;}
  h1{margin:0 0 14px;font-size:20px;font-weight:700;color:#111;}
  p{margin:0 0 12px;font-size:14px;line-height:1.7;color:#555;}
  .btn{display:inline-block;margin:8px 0 4px;padding:12px 28px;background:#cd7f32;
       color:#fff;font-size:14px;font-weight:700;border-radius:8px;text-decoration:none;}
  .footer{background:#f9f9f9;border-top:1px solid #e5e5e5;padding:16px 28px;
          font-size:11px;color:#888;text-align:center;line-height:1.6;}
  .footer a{color:#cd7f32;text-decoration:none;}
</style>
</head>
<body>
<div class="outer">
<div class="wrap">
  <div class="header">
    <div class="header-logo">⚡ Busbar Calculator</div>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    © 2025 PAYAP MACHINERY · All Rights Reserved<br/>
    <a href="${BASE_URL}/terms">Terms</a> &nbsp;·&nbsp;
    <a href="${BASE_URL}/privacy">Privacy</a>
    &nbsp;·&nbsp; ${unsubLine}
  </div>
</div>
</div>
</body>
</html>`;
}

export function welcomeEmail(email: string): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const html = baseLayout(`
    <h1>Welcome to Busbar Calculator</h1>
    <p>Your account is ready. You can now save calculation history, bookmark results, and compare busbars across sessions.</p>
    <a class="btn" href="${BASE_URL}/busbar-calculator">Open Calculator</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">Account: ${email}</p>
  `, unsubLine);
  const text = [
    'Welcome to Busbar Calculator',
    '',
    'Your account is ready.',
    `Open the app: ${BASE_URL}/busbar-calculator`,
    '',
    '---',
    `Account: ${email}`,
    `© 2025 PAYAP MACHINERY`,
    `Unsubscribe: mailto:${FROM_ADDR()}?subject=unsubscribe`,
  ].join('\n');
  return { subject: 'Welcome to Busbar Calculator', html, text };
}

export function subscribeConfirmEmail(email: string): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const html = baseLayout(`
    <h1>You're subscribed!</h1>
    <p>Thank you for subscribing to Busbar Calculator updates. We'll notify you about new features including price alerts and daily reports.</p>
    <a class="btn" href="${BASE_URL}/busbar-calculator">Open Calculator</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">Subscribed as: ${email}</p>
  `, unsubLine);
  const text = [
    "You're subscribed to Busbar Calculator",
    '',
    'Thank you for subscribing. We will notify you about new features.',
    `Open the app: ${BASE_URL}/busbar-calculator`,
    '',
    '---',
    `Subscribed as: ${email}`,
    `© 2025 PAYAP MACHINERY`,
    `Unsubscribe: mailto:${FROM_ADDR()}?subject=unsubscribe`,
  ].join('\n');
  return { subject: 'Subscribed to Busbar Calculator', html, text };
}
