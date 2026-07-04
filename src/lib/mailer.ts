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

function baseLayout(content: string, unsubLine: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Busbar Calculator</title>
<style>
  body{margin:0;padding:0;background:#f2f3f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}
  .outer{background:#f2f3f5;padding:32px 16px;}
  .wrap{max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
        box-shadow:0 4px 16px rgba(0,0,0,0.10);}
  .header{background:#d71920;background:linear-gradient(135deg,#d71920 0%,#e8531f 55%,#f7941d 100%);
          padding:28px 28px 22px;text-align:center;}
  .header img{display:inline-block;}
  .header-logo{font-size:20px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;margin-top:10px;}
  .header-tag{font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;
              color:rgba(255,255,255,0.85);margin-top:4px;}
  .body{padding:30px 30px 26px;}
  h1{margin:0 0 14px;font-size:21px;font-weight:800;color:#16181d;letter-spacing:-0.01em;}
  p{margin:0 0 13px;font-size:14px;line-height:1.75;color:#4b5563;}
  .btn{display:inline-block;margin:10px 0 6px;padding:13px 32px;
       background:#d71920;background:linear-gradient(135deg,#e8531f,#f7941d);
       color:#ffffff !important;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;}
  .feature{margin:0 0 10px;padding:12px 16px;background:#faf7f2;border:1px solid #f0e6d8;
           border-radius:10px;font-size:13px;line-height:1.6;color:#4b5563;}
  .feature b{color:#b45309;}
  .price-row{display:block;padding:12px 16px;margin:0 0 8px;background:#fafafa;
             border:1px solid #eeeeee;border-left:3px solid #f7941d;border-radius:8px;
             font-size:13px;color:#374151;}
  .price-row b{color:#16181d;}
  .price-val{float:right;font-weight:800;color:#b45309;}
  .divider{height:1px;background:#eeeeee;margin:20px 0;}
  .muted{font-size:12px;color:#9ca3af;}
  .footer{background:#16181d;padding:22px 28px;font-size:11px;color:#9ca3af;
          text-align:center;line-height:1.9;}
  .footer a{color:#f7941d;text-decoration:none;}
  .footer-brand{font-size:12px;font-weight:700;color:#e5e7eb;letter-spacing:0.04em;}
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<div class="outer">
<div class="wrap">
  <div class="header">
    <img src="${BASE_URL}/mr-busbar.png" width="58" height="166" alt="Mr Busbar"
         style="width:58px;height:auto;"/>
    <div class="header-logo">Busbar Calculator</div>
    <div class="header-tag">Live copper &amp; aluminum pricing</div>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <span class="footer-brand">PAYAP MACHINERY</span><br/>
    Precision busbar tools for electrical engineers<br/>
    <a href="${BASE_URL}/busbar-calculator">Calculator</a> &nbsp;·&nbsp;
    <a href="${BASE_URL}/terms">Terms</a> &nbsp;·&nbsp;
    <a href="${BASE_URL}/privacy">Privacy</a> &nbsp;·&nbsp; ${unsubLine}<br/>
    © 2026 PAYAP MACHINERY · All Rights Reserved
  </div>
</div>
</div>
</body>
</html>`;
}

export function welcomeEmail(email: string): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const html = baseLayout(`
    <h1>Welcome aboard! 🎉</h1>
    <p>Your Busbar Calculator account is ready. Here's what you just unlocked:</p>
    <div class="feature">🔖 <b>Save &amp; bookmark</b> — keep every calculation in your history, on any device</div>
    <div class="feature">⚖️ <b>Compare configurations</b> — copper vs aluminum, side by side with live deltas</div>
    <div class="feature">✂️ <b>Waste calculator</b> — blade kerf &amp; punch-out losses, per cut</div>
    <div class="feature">🔔 <b>Price alerts</b> — enable the bell to get your saved prices by email</div>
    <div style="text-align:center;">
      <a class="btn" href="${BASE_URL}/busbar-calculator">Open the Calculator</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Signed up as ${email}. If this wasn't you, simply ignore this email.</p>
  `, unsubLine, 'Your account is ready — saving, comparing and price alerts are unlocked.');
  const text = [
    'Welcome to Busbar Calculator!',
    '',
    'Your account is ready. You just unlocked:',
    '- Save & bookmark calculations to your history',
    '- Compare copper vs aluminum configurations side by side',
    '- Waste calculator (blade kerf & punch-out)',
    '- Price alerts for your saved configurations',
    '',
    `Open the app: ${BASE_URL}/busbar-calculator`,
    '',
    '---',
    `Signed up as: ${email}`,
    '© 2026 PAYAP MACHINERY',
    `Unsubscribe: mailto:${FROM_ADDR()}?subject=unsubscribe`,
  ].join('\n');
  return { subject: 'Welcome to Busbar Calculator — your account is ready', html, text };
}

export function resetPasswordEmail(email: string, resetUrl: string): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const html = baseLayout(`
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your Busbar Calculator account. Click the button below to choose a new password. This link expires in 30 minutes.</p>
    <a class="btn" href="${resetUrl}">Reset Password</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
    <p style="margin-top:8px;font-size:12px;color:#aaa;">Account: ${email}</p>
  `, unsubLine);
  const text = [
    'Reset your Busbar Calculator password',
    '',
    'We received a request to reset your password.',
    `Reset link (expires in 30 minutes): ${resetUrl}`,
    '',
    "If you didn't request this, ignore this email — your password will not change.",
    '',
    '---',
    `Account: ${email}`,
    `© 2025 PAYAP MACHINERY`,
  ].join('\n');
  return { subject: 'Reset your Busbar Calculator password', html, text };
}

export function subscribeConfirmEmail(email: string): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const html = baseLayout(`
    <h1>🔔 Price alerts activated</h1>
    <p>You're all set! From now on we'll keep you posted on the metal market:</p>
    <div class="feature">📈 <b>Daily digest</b> — live COMEX copper &amp; LME aluminum prices for your saved configurations</div>
    <div class="feature">⚡ <b>Feature news</b> — price alerts, trends and new tools, the moment they ship</div>
    <p>Tip: the more configurations you bookmark, the more useful your digest gets.</p>
    <div style="text-align:center;">
      <a class="btn" href="${BASE_URL}/busbar-calculator">Save a Configuration</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Subscribed as ${email}. You can unsubscribe anytime with one click below.</p>
  `, unsubLine, 'Price alerts are on — daily copper & aluminum prices for your saved busbars.');
  const text = [
    'Price alerts activated — Busbar Calculator',
    '',
    "You're all set! You'll receive:",
    '- A daily digest of live copper & aluminum prices for your saved configurations',
    '- News about price alerts, trends and new tools',
    '',
    `Open the app: ${BASE_URL}/busbar-calculator`,
    '',
    '---',
    `Subscribed as: ${email}`,
    '© 2026 PAYAP MACHINERY',
    `Unsubscribe: mailto:${FROM_ADDR()}?subject=unsubscribe`,
  ].join('\n');
  return { subject: '🔔 Price alerts activated — Busbar Calculator', html, text };
}

// ── Daily price digest ────────────────────────────────────────────────────────
// Ready for the daily cron: pass the user's saved configurations plus the
// day's spot prices. Kept pure (no DB access) so it is trivially testable.
export interface DigestItem {
  name: string;                       // e.g. "Main panel busbar"
  metal: 'copper' | 'aluminum';
  dims: string;                       // e.g. "1000×100×10 mm"
  price: string;                      // formatted, e.g. "1,348.30 USD"
}

export function dailyPriceReportEmail(
  email: string,
  copperPerKg: number,
  aluminumPerKg: number,
  items: DigestItem[],
): { subject: string; html: string; text: string } {
  const unsubLine = `<a href="mailto:${FROM_ADDR()}?subject=unsubscribe">Unsubscribe</a>`;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const itemRows = items.length
    ? items.map(i => `
      <div class="price-row">
        <span class="price-val">${i.price}</span>
        <b>${i.name}</b><br/>
        <span style="color:#9ca3af;">${i.metal === 'copper' ? '🟠 Copper' : '🔵 Aluminum'} · ${i.dims}</span>
      </div>`).join('')
    : `<p class="muted">You have no saved configurations yet — bookmark one in the app and it will appear here tomorrow.</p>`;

  const html = baseLayout(`
    <h1>📈 Your daily busbar prices</h1>
    <p class="muted" style="margin-top:-8px;">${dateStr}</p>
    <div class="price-row"><span class="price-val">$${copperPerKg.toFixed(3)} /kg</span><b>Copper</b> — COMEX spot</div>
    <div class="price-row"><span class="price-val">$${aluminumPerKg.toFixed(3)} /kg</span><b>Aluminum</b> — LME spot</div>
    <div class="divider"></div>
    <p style="font-weight:700;color:#16181d;">Your saved configurations</p>
    ${itemRows}
    <div style="text-align:center;">
      <a class="btn" href="${BASE_URL}/busbar-calculator">Open Live Calculator</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Sent to ${email} because price alerts are enabled.</p>
  `, unsubLine, `Copper $${copperPerKg.toFixed(2)}/kg · Aluminum $${aluminumPerKg.toFixed(2)}/kg — today's digest.`);

  const text = [
    `Your daily busbar prices — ${dateStr}`,
    '',
    `Copper (COMEX):   $${copperPerKg.toFixed(3)} /kg`,
    `Aluminum (LME):   $${aluminumPerKg.toFixed(3)} /kg`,
    '',
    'Your saved configurations:',
    ...(items.length
      ? items.map(i => `- ${i.name} (${i.metal}, ${i.dims}): ${i.price}`)
      : ['(none yet — bookmark one in the app)']),
    '',
    `Open the app: ${BASE_URL}/busbar-calculator`,
    '',
    '---',
    `Sent to: ${email}`,
    `Unsubscribe: mailto:${FROM_ADDR()}?subject=unsubscribe`,
  ].join('\n');

  return { subject: `📈 Busbar prices today — Copper $${copperPerKg.toFixed(2)}/kg`, html, text };
}
