# PAYAPRESS WebApp

> Professional copper busbar cost calculator for electrical panel fabricators — live COMEX pricing, IEC/DIN standard sizes, embeddable in WordPress.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/PAYAPRESS-prog/payapresswebapp)](https://github.com/PAYAPRESS-prog/payapresswebapp/issues)

---

## Features

- **Live copper price** — COMEX HG=F via Yahoo Finance, auto-refreshed every 5 minutes, no API key needed
- **22 standard busbar sizes** — IEC 60317 / DIN 46433 (15×2 mm up to 160×10 mm)
- **3 material grades** — Cu-ETP (99.9%), Cu-OF (99.95%), Cu-OFE (99.99%)
- **Multi-currency** — USD, EUR, GBP with live FX rates
- **Quantity calculator** — enter meters needed, get total weight and cost
- **Cross-section SVG diagram** — visual representation of selected size
- **WordPress shortcode** — embed via `[payapress_app]` in any page
- **Standalone iframe** — `/embed` route for headless embedding

---

## Project Structure

```
payapresswebapp/
├── frontend/                    # Next.js 15 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/copper-price/  # COMEX price endpoint (cached 5 min)
│   │   │   ├── api/fx-rate/       # EUR/GBP/CAD rates (cached 1 hr)
│   │   │   ├── embed/             # Minimal page for iframe embedding
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── CopperCalculator.tsx  # Main interactive calculator
│   │   │   ├── Header.tsx            # Live price ticker header
│   │   │   └── ComingSoonSection.tsx
│   │   ├── lib/
│   │   │   ├── copperData.ts   # Busbar sizes + material grades constants
│   │   │   └── copperPrice.ts  # calculateCost(), fmt(), fmtUSD()
│   │   └── types/calculator.ts
│   ├── jest.config.js
│   └── package.json
│
└── wordpress-plugin/
    ├── includes/
    │   ├── class-payapress-shortcode.php  # [payapress_app] shortcode
    │   ├── class-payapress-settings.php   # Admin settings page
    │   ├── class-payapress-cors.php
    │   └── class-payapress-rest-api.php
    └── payapress-webapp.php
```

---

## Quick Start

### 1. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — see Configuration section below
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # run unit tests
```

### 2. Deploy to Vercel (recommended — free)

1. Import this repository in the [Vercel dashboard](https://vercel.com/new)
2. **Set Root Directory → `frontend`**
3. Add environment variables from `.env.example`
4. Deploy — Vercel handles the rest

### 3. WordPress Plugin

1. Copy `wordpress-plugin/` → `wp-content/plugins/payapress-webapp/`
2. Activate in WordPress admin → Plugins
3. Go to **Settings → PAYAPRESS WebApp**
4. Enter your Next.js app URL (e.g., `https://your-app.vercel.app`)
5. Add `[payapress_app]` shortcode to any page

```
[payapress_app]                    ← default 650px height
[payapress_app height="800"]       ← custom height
[payapress_app path="/embed"]      ← explicit embed path
```

---

## Configuration

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_WP_URL` | WordPress site URL | `https://mysite.com` |
| `NEXT_PUBLIC_WP_API_BASE` | WordPress REST API base | `https://mysite.com/wp-json/wp/v2` |
| `PAYAPRESS_SECRET_KEY` | Plugin auth secret | *(random 32-byte string)* |

> Copper prices and FX rates are fetched from free public APIs (no API key required).

---

## API Endpoints

| Route | Description | Cache |
|---|---|---|
| `GET /api/copper-price` | COMEX Cu price in USD (lb, kg, MT) | 5 min |
| `GET /api/fx-rate` | EUR/GBP/CAD/AED per USD | 1 hour |

---

## Calculation Formula

```
Volume (cm³/m) = width(mm) × thickness(mm)
Weight (kg/m)  = Volume × density(g/cm³) / 1000
Cost ($/m)     = Weight × copperPrice($/kg)
Cost ($/m²)    = Cost/m ÷ (width / 1000)
```

All densities follow IEC/EN standards:
- Cu-ETP: 8.89 g/cm³
- Cu-OF:  8.92 g/cm³
- Cu-OFE: 8.94 g/cm³

---

## Roadmap

- [ ] Aluminum busbar calculator (Al-99.5E)
- [ ] Historical copper price chart (30-day)
- [ ] PDF/CSV export of results
- [ ] Multiple busbars per project (bill of materials)
- [ ] WooCommerce product price sync
- [ ] Admin dashboard for price history

---

## Contributing

PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).
