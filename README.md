# PAYAPRESS — Busbar Calculator

> Professional copper & aluminum busbar cost calculator for electrical panel fabricators.  
> Live COMEX & LME pricing · 22 currencies · IEC/DIN standards · Installable PWA.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[Live App](https://calculator.payapress.com)** · **[API Reference](docs/API.md)** · **[Architecture](docs/architecture.md)** · **[Changelog](CHANGELOG.md)**

---

## Overview

PAYAPRESS Busbar Calculator is a production-grade web application that helps electrical panel fabricators calculate the material cost of copper and aluminum busbars in real time. It pulls live metal prices from COMEX (copper) and LME (aluminum), supports 22 currencies with live FX rates, and ships as an installable PWA with a public REST API.

---

## Features

### Copper Busbar
- **Live COMEX HG=F pricing** via Yahoo Finance, auto-refreshed every 5 minutes
- **3 material grades:** Cu-ETP (99.90%) · Cu-OF (99.95%) · Cu-OFE (99.99%)
- **IEC 60317-3 / EN 13601** standard size presets (25×3 mm → 120×10 mm)

### Aluminum Busbar
- **Live LME ALI=F pricing** via Yahoo Finance (USD/MT → USD/kg, server-side)
- **3 material grades:** Al-1350 EC (99.50%) · Al-6101 · Al-6063
- **IEC 60317-40** standard size presets (20×3 mm → 160×12 mm)

### Calculator
- Manual width × thickness inputs (any dimension, no preset lock-in)
- Length input in mm — total weight and cost auto-calculated
- 22 currencies with live ECB/Frankfurter FX rates
- Auto locale detection (defaults to user's local currency)
- Manual price override for custom pricing scenarios
- Copy results to clipboard (formatted report)
- IEC standard badge highlights when a size matches published standards

### Visual
- Photorealistic 3D busbar SVG renderer with per-metal color palette
- Drag-to-resize busbar viewer (pointer capture)
- Animated result cards with Framer Motion spring physics
- Achievement badges · milestone toasts · confetti burst

### PWA
- Installable as a home-screen web app on iOS and Android
- Service worker with cache-first static assets and network-only HTML
- Offline fallback page
- Auto-recovery from stale-cache errors on every new deploy

### Embedding & API
- Public REST API `/api/v1/` with full CORS (`Access-Control-Allow-Origin: *`)
- `/embed` route for frameless iframe embedding
- WordPress companion plugin with `[payapress_app]` shortcode

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 15 |
| UI | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 12 |
| Runtime | Node.js | ≥ 20 |
| Process manager | PM2 (ecosystem.config.js) | — |
| Testing | Jest + ts-jest | — |

---

## Project Structure

```
payapresswebapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── copper-price/      # COMEX HG=F · 5-min server cache
│   │   │   ├── aluminum-price/    # LME ALI=F · 5-min server cache
│   │   │   ├── fx-rate/           # ECB FX rates · 6-hr server cache
│   │   │   └── v1/                # Public REST API (CORS *)
│   │   │       ├── calculate/
│   │   │       ├── copper-price/
│   │   │       └── fx-rates/
│   │   ├── embed/                 # Minimal page for iframe embedding
│   │   ├── offline/               # PWA offline fallback
│   │   ├── roadmap/               # Product roadmap page
│   │   ├── whitepaper/            # Technical whitepaper
│   │   ├── layout.tsx             # Root layout, SW registration, error capture
│   │   └── page.tsx
│   ├── components/
│   │   ├── CopperCalculator.tsx   # Main calculator — Cu & Al toggle
│   │   ├── BusbarRender.tsx       # Photorealistic SVG busbar (Cu + Al palette)
│   │   ├── DynamicPage.tsx        # ssr:false wrapper for calculator
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ComingSoonSection.tsx
│   │   ├── Footer.tsx
│   │   ├── InstallPrompt.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── SectionErrorBoundary.tsx
│   │   └── SplashScreen.tsx
│   ├── lib/
│   │   ├── serverPrices.ts        # Server-side price fetching (ISR, shared by page + API routes)
│   │   ├── copperData.ts          # Cu grades, IEC sizes
│   │   ├── aluminumData.ts        # Al grades, IEC 60317-40 sizes
│   │   ├── copperPrice.ts         # calculateCost(), fmt(), fmtUSD()
│   │   └── fetchWithRetry.ts      # Fetch with exponential backoff
│   ├── styles/globals.css         # Tailwind v4 @theme + design tokens
│   └── types/calculator.ts
├── public/
│   ├── sw.js                      # Service worker (v12)
│   ├── manifest.json              # PWA manifest
│   └── icons/
├── docs/
│   ├── API.md                     # Public REST API reference
│   └── architecture.md            # Technical architecture overview
├── wordpress-plugin/              # WP plugin with [payapress_app] shortcode
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── server.js                      # Custom Node.js server (Hostinger)
├── ecosystem.config.js            # PM2 process config
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Quick Start

```bash
git clone https://github.com/PAYAPRESS-prog/payapresswebapp.git
cd payapresswebapp
cp .env.example .env.local
npm install
npm run dev          # → http://localhost:3000
npm run build        # production build
npm test             # unit tests
npm run type-check   # TypeScript check
```

---

## Deployment

The app runs on **Hostinger shared hosting** with Node.js and PM2. The compiled `.next/` directory is committed to the repository and served directly — no CI build step needed on the server.

```bash
npm run build
git add .next
git commit -m "chore: rebuild for deploy"
git push
# Hostinger pulls from the branch and PM2 restarts the process
```

The custom `server.js` handles:
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, CSP, etc.)
- `Cache-Control: no-store` on all HTML responses (prevents stale page caching)
- `X-Robots-Tag: noindex, nofollow` until public launch
- CORS headers on `/api/*` routes

---

## API

Full reference: **[docs/API.md](docs/API.md)**

**Base URL:** `https://calculator.payapress.com/api/v1`

| Endpoint | Description | Cache |
|----------|-------------|-------|
| `GET /calculate` | Busbar cost given dimensions, grade, metal, currency | Per request |
| `GET /copper-price` | Live COMEX HG=F price (USD/lb · kg · MT) | 5 min |
| `GET /fx-rates` | USD-based FX rates for all 22 currencies | 6 hr |

**Quick example:**
```http
GET https://calculator.payapress.com/api/v1/calculate?width=60&thickness=8&length=6000&grade=cu-etp&currency=AED
```

---

## Calculation Formula

```
A  (mm²)  = width × thickness
W  (kg/m) = A × density / 1000
C  ($/m)  = W × metal_price_usd_per_kg
P  ($/m²) = C / (width / 1000)
T  ($)    = C × (length_mm / 1000)
```

**Densities (IEC/EN):**

| Grade | Density (g/cm³) | Standard |
|-------|-----------------|----------|
| Cu-ETP | 8.89 | EN 13601 / IEC 60317-3 |
| Cu-OF | 8.92 | EN 13601 |
| Cu-OFE | 8.94 | ASTM C10100 |
| Al-1350 | 2.703 | IEC 60317-40 |
| Al-6101 | 2.700 | IEC 60317-40 |
| Al-6063 | 2.690 | IEC 60317-40 |

---

## Roadmap

- [x] Copper busbar calculator (Cu-ETP, Cu-OF, Cu-OFE)
- [x] Aluminum busbar calculator (Al-1350, Al-6101, Al-6063)
- [x] Live COMEX & LME pricing
- [x] 22 currencies with live FX rates
- [x] Installable PWA with offline support
- [x] Public REST API v1
- [x] Drag-to-resize busbar viewer
- [ ] Historical 30-day price chart
- [ ] PDF / CSV export
- [ ] Multi-busbar bill of materials
- [ ] WooCommerce product price sync

See the full roadmap at [/roadmap](https://calculator.payapress.com/roadmap).

---

## Contributing

Pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening one.

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built by the PAYAP MACHINERY engineering team · [payapress.com](https://www.payapress.com)*
