# Architecture Overview

_Last updated: July 2026 — the four-platform release._

## One live core, four platforms

```
        COMEX HG=F      LME aluminum      FX rates
             └──────────────┼──────────────┘
                            ▼  server-side fetch · 5-min cache
              ┌─────────────────────────────┐
              │   Next.js 15 (App Router)   │
              │   custom server.js · ISR    │
              │   Hostinger + Passenger     │
              └──────┬───────┬───────┬──────┘
                     │       │       │
        ┌────────────┼───────┼───────┼────────────┐
        ▼            ▼       ▼       ▼            ▼
     Web · PWA   Windows   Android   iOS      REST API v1
     (SW v8x)    Tauri 2    TWA    Capacitor   /api/v1/*
```

The web application IS the product. The three native shells wrap the same
origin, so **every web deploy is instantly an app update** — no store
re-submission for feature work.

## The shells

| Platform | Tech | Key integration |
|---|---|---|
| Windows (`desktop/`) | Tauri 2, Rust-built window | navigation whitelist (product + Google auth + `tauri.localhost`), bundled offline bootstrap with a `no-cors` connectivity probe, `busbar://` deep links, NSIS + MSI via CI |
| Android (`android/`) | Trusted Web Activity (androidbrowserhelper) | Digital Asset Links at `/.well-known/assetlinks.json` (upload-key SHA-256; add the Play App Signing key after first Play upload), `<queries>` package-visibility block (required on Android 11+), signed APK + AAB via CI |
| iOS (`ios/`) | Capacitor 7 | `apple-app-site-association` served by a route handler (guaranteed `application/json`), Sign in with Apple (native sheet in-app, JS popup on web), bundled offline errorPath page |

## Live data pipeline

- `src/lib/serverPrices.ts` fetches COMEX HG=F (copper), the LME aluminum
  reference and FX rates **server-side**, cached ~5 minutes.
- Pages use ISR; API routes serve the same cached values.
- If a feed stalls, `isFallback` propagates to the UI as an amber
  “Estimated price” badge — estimates are never presented as live.

## Service worker (web)

- Static `_next/static` assets: cache-first (content-hashed).
- HTML navigations: network-only with a pre-cached `/offline` fallback.
- `/api/*`: network-only with a JSON 503 offline body.
- `/.well-known/*`: never intercepted (Android/iOS link verification must
  always see fresh files).
- Cache version bumps on every CSS/JS-affecting deploy.

## Hosting rules that shape the code (Passenger)

- All DB writes and email sends are **awaited before the response** —
  Passenger freezes the process after responding, so fire-and-forget work
  silently dies. Long sends are capped with `Promise.race` (~8 s).
- New API routes require an app restart in the hosting panel; content-only
  deploys do not.

## Auth & data

- Sessions: httpOnly JWT cookies (HS256, `jose`), 30 days.
- Sign-in: email OTP, Google Identity Services (server-verified ID token),
  Sign in with Apple (JWKS-verified identity token; native aud = bundle id,
  web aud = Services ID).
- MySQL via `mysql2`; tables self-heal (CREATE IF NOT EXISTS + column
  backfill) so there is no migration step on shared hosting.
- EPLAN imports are parsed entirely client-side (`src/lib/panelImport.ts`) —
  dependency-free XLSX (ZIP + DecompressionStream) and delimited-text
  parsing with a three-layer import audit.

## CI / release pipelines (`.github/workflows/`)

| Workflow | Trigger | Output |
|---|---|---|
| `ci.yml` | every push | lint · types · unit + smoke tests · build |
| `release-windows.yml` | `desktop-v*` / manual | signed-name NSIS x64+ARM64, MSI, checksums → GitHub Release |
| `release-android.yml` | `android-v*` / manual | signed universal APK + AAB (keystore from repo secrets), checksums |
| `release-ios.yml` | `ios-v*` / manual | unsigned validation archive; with signing secrets: IPA + TestFlight upload |

The `/download` page reads the GitHub releases list and links each
platform's newest `desktop-v*` / `android-v*` tag automatically.
