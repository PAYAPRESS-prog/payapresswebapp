# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-07-08 · Multi-platform launch

### Added
- **Official Windows app** (Tauri 2): NSIS x64/ARM64 + MSI installers, offline bootstrap, deep links — v1.0.2
- **Official Android app** (Trusted Web Activity): signed APK/AAB, Digital Asset Links, Google Play submission kit — v1.0.1
- **iOS app** (Capacitor 7): Sign in with Apple, universal links (AASA), App Store kit — TestFlight-ready
- **Sign in with Apple** end-to-end (web JS flow + native sheet + JWKS-verified backend)
- **EPLAN panel cost tool**: client-side import (XLSX/CSV/UTF-16, DE/EN headers), column mapping with import audit, FFD offcut packing, live/custom rates
- **Aluminum** alongside copper with live LME pricing; currency UX overhaul (pick before Calculate, persistent custom chip)
- **Busbar Admin** back-office (7 sections) and **Busbar Pulse** in-app micro-surveys
- Daily price digest email; per-platform `/download` page with live release detection
- Roadmap & Whitepaper relaunch (animated showpiece pages); site-wide SEO pass; mobile footer

### Fixed
- Windows shell: black-window launch (`tauri.localhost` whitelist) and false “offline” screen (CORS/CORP on the connectivity probe)
- Android 11+ TWA degradation (missing package-visibility `<queries>`)
- Offline cold start now shows the branded page (SW pre-caches `/offline`)
- Welcome/admin emails on Passenger (all sends awaited)

---

## [1.1.0] — 2025-05-25

### Added
- **Aluminum busbar calculator** — full Cu / Al metal toggle in the main calculator
- **Al-1350 EC, Al-6101, Al-6063 grades** — densities per IEC 60317-40
- **IEC 60317-40 size presets** — 17 standard sizes from 20×3 to 160×12 mm
- **`/api/aluminum-price`** — fetches LME ALI=F futures via Yahoo Finance; converts USD/MT → USD/kg; 5-min server cache; fallback $2 500/MT
- **`src/lib/aluminumData.ts`** — aluminum grade constants and standard sizes
- **Aluminum SVG palette in `BusbarRender`** — cool silver-grey gradient set triggered by `metal="aluminum"` prop
- **Metal-aware price mood indicator** — separate thresholds for Cu ($7–$13/kg) and Al ($2–$3.2/kg)
- **Metal-aware achievement badges** — EC Grade, High Strength badges for aluminum; IEC STD badge uses correct standard per metal
- **ChunkLoadError auto-recovery** — `beforeInteractive` script intercepts stale JS chunk 404s (both `window.error` and `unhandledrejection`) and triggers a hard reload with `?_pp=<timestamp>` cache-bust parameter before Next.js can render the "Application error" overlay
- **Service worker v11** — `activate` event purges all `payapress-shell-v10` caches, removing stale chunk files from client storage

### Changed
- `BusbarRender` accepts `metal?: 'copper' | 'aluminum'` prop; defaults to `'copper'`
- Quick preset chips (`COPPER_QUICK_PRESETS` / `ALUMINUM_QUICK_PRESETS`) switch dynamically on metal toggle
- `handleMetalSwitch` resets grade selection and clears manual price override on toggle
- `getPriceMood` and `getAchievements` are now metal-aware

### Fixed
- **Mobile "Application error" on browsers with old cached HTML** — iOS WKWebView (Safari, Chrome iOS, Firefox iOS) now auto-recovers via ChunkLoadError interception without user action

---

## [1.0.0] — 2025-05-20

### Added
- **Public REST API v1** — `GET /api/v1/calculate`, `/api/v1/copper-price`, `/api/v1/fx-rates`
  with full CORS support (`Access-Control-Allow-Origin: *`) and structured JSON responses
- **Manual dimension inputs** — user enters busbar width × thickness in mm directly
- **Manual length input** — user enters length in mm; total weight and cost calculated automatically
- **Searchable currency dropdown** — custom `CurrencySelector` with flag images, live search, and AnimatePresence animation
- **22 currencies** — USD, EUR, GBP, CHF, JPY, CAD, AUD, AED, SAR, KWD, QAR, BHD, CNY, INR, SGD, KRW, TRY, BRL, MXN, NOK, SEK, ZAR
- **Gulf pegged currencies** — AED, SAR, QAR, KWD, BHD with fixed central-bank peg rates
- **Proportional busbar SVG** — cross-section diagram scales so pixel W:H ratio exactly matches real mm dimensions
- **Auto locale detection** — defaults to user's local currency based on `navigator.language`
- **`docs/API.md`** — complete public API reference
- **`docs/architecture.md`** — technical architecture overview
- **`SECURITY.md`** — responsible disclosure policy
- **`.editorconfig`** — consistent editor settings

### Changed
- FX rates source upgraded to **Frankfurter (ECB)** — free, reliable, no API key required
- Copper price source: **COMEX HG=F via Yahoo Finance**, cached 5 minutes server-side
- `body` `overflow-x: hidden` removed — was breaking `position: sticky` on iOS Safari

### Removed
- Three.js / `@react-three/fiber` / `@react-three/drei` (replaced by SVG renderer)
- Busbar size preset dropdown (replaced by free-form inputs + quick preset chips)
- Price ticker from header

### Fixed
- `fmtCurrency` TypeScript error on `as const` union comparison
- Volume hint formula double-divide
- Copy-to-clipboard output now shows length in mm

---

## [0.3.0] — 2025-05-15

### Added
- Photorealistic copper busbar SVG renderer with multi-face shading, ambient glow, and edge highlights
- Drag-to-resize busbar viewer (pointer capture)
- Scroll-reveal entrance animation
- Animated number transitions on result cards
- `viewer-bg` studio lighting gradient
- Copper-themed custom scrollbar
- Gamification: IEC preset chips, achievement badges, confetti burst, calc counter, milestone toasts, price mood indicator
- CSS detection loop — auto-redirects with `?_pp=` cache-bust if Tailwind CSS bundle fails to load
- Service worker (v1 → v10 iterations) with cache-first `_next/static/`, network-only navigation
- PWA manifest and install prompt

---

## [0.2.0] — 2025-05-10

### Added
- Multi-currency support with live FX rates
- Three material grades: Cu-ETP, Cu-OF, Cu-OFE
- Copy-to-clipboard results
- WordPress companion plugin
- `/embed` route for iframe embedding
- GitHub Actions CI workflow
- Issue templates and PR template

---

## [0.1.0] — 2025-05-01

### Added
- Initial Next.js 15 scaffold with TypeScript and Tailwind CSS v4
- Basic copper busbar cost calculator
- Live COMEX copper price via Yahoo Finance HG=F (server route, 5-min cache)
- `calculateCost()` pure function with unit tests
- Copper brand color palette and dark surface tokens

[1.1.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/releases/tag/v0.1.0
