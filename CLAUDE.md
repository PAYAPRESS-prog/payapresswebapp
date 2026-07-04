# CLAUDE.md — PAYAPRESS Busbar Calculator

Project-level instructions and checkpoints for Claude Code sessions.

---

## Project Overview

- **App:** PAYAPRESS Copper & Aluminum Busbar Cost Calculator
- **URL:** https://calculator.payapress.com
- **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4
- **Hosting:** Hostinger shared hosting + Node.js (custom server.js)
- **Deployment:** `.next/` artifacts committed to git; Hostinger auto-deploys on push
- **Branch:** `claude/payapress-webapp-setup-0bjxA`

---

## savex — Stable Checkpoint System

When the user says **`savex`**, restore the project to the last known stable state.

### Current Stable Checkpoint

| Field | Value |
|-------|-------|
| **Tag** | `savex/stable-v1` |
| **Commit** | `2999c6bbf272ab034ddf2ca597500256a77a93fb` |
| **Date** | 2026-05-26 |
| **Status** | ✅ No bugs. Build clean. Deployed to calculator.payapress.com |

### What this state includes
- React #418 hydration error fixed (SplashScreen uses `useState('showing')`)
- InstallPrompt overflow on Windows fixed (max-w-md, truncate, whitespace-nowrap)
- `NEXT_PUBLIC_BASE_URL=https://calculator.payapress.com` baked into `.next/`
- Service Worker v12
- ISR with server-side price fetching (copper, aluminum, FX)
- URL-based ChunkLoadError recovery (`?_pp=<timestamp>`)

### How to restore (when user says "savex")

```bash
git fetch origin
git checkout claude/payapress-webapp-setup-0bjxA
git reset --hard 2999c6bbf272ab034ddf2ca597500256a77a93fb
npm run build
git add -A
git commit -m "restore: savex/stable-v1"
git push -u origin claude/payapress-webapp-setup-0bjxA
```

### How to update the checkpoint (when user says "savex save" or "ذخیره savex")

1. Confirm the build is clean: `npm run build`
2. Update the **Commit** hash in this file to `git rev-parse HEAD`
3. Commit and push this CLAUDE.md

---

## savealfa — Complete Figma Design Overhaul Checkpoint

When the user says **`savealfa`**, restore the project to this fully styled Figma-matching state.

### Current Stable Checkpoint

| Field | Value |
|-------|-------|
| **Tag** | `savealfa/stable` |
| **Commit** | `8f29a1106e4f2a35d633885f3d8565b78967b0b7` |
| **Date** | 2026-05-27 |
| **Status** | ✅ Full Figma match. Build clean. Edge-to-edge mobile layout. |

### What this state includes
- **Full Figma design overhaul**: edge-to-edge card on mobile, centered on desktop
- **Floating notched-outline labels**: FigmaInput component with Material Design 3 style
- **Design tokens**: `--color-text-1..4`, `--color-success*`, `--space-1..8`, `--color-brand*`, `--color-al`
- **Active state glow**: Orange box-shadow on pills, grades, metal toggle when active
- **Responsive layout**: `.calc-bleed` full-viewport-width on mobile, normal centering on sm+
- **SVG scaling fix**: BusbarRender uses `height: auto` with `preserveAspectRatio` for proper scaling
- **Accessibility**: All touch targets ≥ 44px (WCAG 2.5.5 compliant)
- **Service Worker v13**: Cache invalidation for fresh CSS delivery
- **Consistent spacing**: Single `.page-container` utility across Header/page/Footer

### How to restore (when user says "savealfa")

```bash
git fetch origin
git checkout claude/payapress-webapp-setup-0bjxA
git reset --hard 8f29a1106e4f2a35d633885f3d8565b78967b0b7
npm run build
git add -A
git commit -m "restore: savealfa/stable"
git push -u origin claude/payapress-webapp-setup-0bjxA
```

### How to update the checkpoint (when user says "savealfa save" or "ذخیره savealfa")

1. Confirm the build is clean: `npm run build`
2. Update the **Commit** hash above to `git rev-parse HEAD`
3. Commit and push this CLAUDE.md

---

## 🚀 Launch Checklist (do these when going public)

1. ~~Enable SEO indexing~~ ✅ DONE — site is indexed; /busbar-calculator is
   the primary SEO target (title/description/JSON-LD schema live there).
   Private surfaces stay noindex: /app/* (src/app/app/layout.tsx),
   /reset-password, /signup + robots.txt disallow.
2. Verify all Hostinger env vars are set: `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` (≥16 chars), `SMTP_HOST`,
   `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
   Keep a copy of the VALUES in a password manager — they exist nowhere else.
3. Confirm password-reset works end-to-end (auth sheet → Forgot Password →
   email link → /reset-password → auto login).

## 🛡 Ops Guardrails

- **Uptime monitoring:** add https://calculator.payapress.com/api/copper-price
  to UptimeRobot (free) — alerts when the site or price feed dies.
- **DB backups:** in Hostinger hPanel set a weekly cron:
  `mysqldump -u $DB_USER -p"$DB_PASSWORD" $DB_NAME > ~/backups/busbar_$(date +\%F).sql`
  and download a copy monthly.
- **CI:** `.github/workflows/ci.yml` runs lint + types + unit tests +
  smoke tests + build on every push. A red run = the deployed commit is
  broken; fix forward or revert.
- **Price fallback:** when Yahoo Finance is down the app shows an amber
  "Estimated price" badge (`isFallback` from /api/copper-price). If it stays
  on for hours the feed shape may have changed — check `src/lib/serverPrices.ts`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, CSP headers, SW registration, error capture |
| `src/app/page.tsx` | Async server component, ISR with revalidate:300 |
| `src/components/SplashScreen.tsx` | Splash (useState 'showing' — prevents hydration mismatch) |
| `src/components/CopperCalculator.tsx` | Main calculator — Cu & Al toggle |
| `src/lib/serverPrices.ts` | Server-side price fetching shared by page + API routes |
| `public/sw.js` | Service Worker v12 |
| `server.js` | Custom Node.js server for Hostinger |
| `.env.production` | `NEXT_PUBLIC_BASE_URL=https://calculator.payapress.com` |

---

## Common Tasks

### After any code change
```bash
npm run build
git add -A
git commit -m "feat/fix: description"
git push -u origin claude/payapress-webapp-setup-0bjxA
```

### Check for errors
```bash
npm run build 2>&1 | grep -E "error|Error|warn"
```
