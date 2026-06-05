import nodemailer from 'nodemailer';

// ── SMTP transport (Hostinger) ────────────────────────────────────────────────
// Reads from env vars set in .env.production / Hostinger process environment.
// Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional: SMTP_FROM  (defaults to SMTP_USER)

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
    socketTimeout: 10_000,
  });
}

// Singleton — reuse connection pool across API calls.
// Type widened because nodemailer pool vs. non-pool transporter types differ.
// eslint-disable-next-line
let _transport: nodemailer.Transporter<unknown> | null = null;

function getTransport() {
  if (!_transport) _transport = createTransport();
  return _transport;
}

export function isMailerConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

const FROM = () =>
  process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@calculator.payapress.com';

// ── Send helper ───────────────────────────────────────────────────────────────

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn('[mailer] SMTP not configured — skipping email to', opts.to);
    return;
  }
  await transport.sendMail({
    from: `"Busbar Calculator" <${FROM()}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

// ── Email templates ───────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://calculator.payapress.com';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#060608; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
  .wrap { max-width:520px; margin:0 auto; padding:40px 24px; }
  .logo { font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
          color:#cd7f32; margin-bottom:32px; }
  .card { background:#12151f; border:1px solid rgba(255,255,255,0.07); border-radius:16px;
          padding:32px 28px; }
  h1 { margin:0 0 16px; font-size:22px; font-weight:800; color:#f5f7fa; }
  p  { margin:0 0 14px; font-size:14px; line-height:1.75; color:#a1a1aa; }
  .btn { display:inline-block; margin-top:8px; padding:12px 28px;
         background:linear-gradient(135deg,#cd7f32,#b87333);
         color:#fff; font-size:14px; font-weight:700; border-radius:10px;
         text-decoration:none; }
  .footer { margin-top:28px; font-size:11px; color:#3f3f46; text-align:center; }
  .footer a { color:#cd7f32; text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">⚡ Busbar Calculator</div>
  <div class="card">${content}</div>
  <div class="footer">
    © 2025 PAYAP MACHINERY · Trading as PAYAPRESS · All Rights Reserved<br/>
    <a href="${BASE_URL}/terms">Terms of Use</a> &nbsp;·&nbsp;
    <a href="${BASE_URL}/privacy">Privacy Policy</a>
  </div>
</div>
</body>
</html>`;
}

export function welcomeEmail(email: string): { subject: string; html: string; text: string } {
  const html = baseLayout(`
    <h1>Welcome to Busbar Calculator 👋</h1>
    <p>Your account is ready. You can now save calculation history, bookmark results, and compare busbars across sessions.</p>
    <a class="btn" href="${BASE_URL}/busbar-calculator">Open Calculator →</a>
    <p style="margin-top:24px;font-size:12px;color:#52525b;">
      Signed in as <strong style="color:#f5f7fa;">${email}</strong>
    </p>
  `);
  const text = `Welcome to Busbar Calculator!\n\nYour account is ready.\nOpen the app: ${BASE_URL}/busbar-calculator\n\n© 2025 PAYAP MACHINERY`;
  return { subject: 'Welcome to Busbar Calculator', html, text };
}

export function subscribeConfirmEmail(email: string): { subject: string; html: string; text: string } {
  const html = baseLayout(`
    <h1>You're on the list ✅</h1>
    <p>We'll notify you when new features land — price alerts, export options, and more.</p>
    <p>Meanwhile, the calculator is live and ready to use:</p>
    <a class="btn" href="${BASE_URL}/busbar-calculator">Open Calculator →</a>
    <p style="margin-top:24px;font-size:12px;color:#52525b;">
      Subscribed as <strong style="color:#f5f7fa;">${email}</strong>
    </p>
  `);
  const text = `You're subscribed to Busbar Calculator updates.\nOpen the app: ${BASE_URL}/busbar-calculator\n\n© 2025 PAYAP MACHINERY`;
  return { subject: "You're on the list — Busbar Calculator", html, text };
}
