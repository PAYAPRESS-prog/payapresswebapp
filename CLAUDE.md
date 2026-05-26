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
