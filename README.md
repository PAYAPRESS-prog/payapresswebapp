# PAYAPRESS WebApp

> Professional copper busbar cost calculator for electrical panel fabricators — live COMEX pricing, manual dimension inputs, 22 supported currencies, embeddable in WordPress, with a public REST API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/PAYAPRESS-prog/payapresswebapp)](https://github.com/PAYAPRESS-prog/payapresswebapp/issues)

---

## Features

- **Live copper price** — COMEX HG=F via Yahoo Finance, auto-refreshed every 5 minutes, no API key needed
- **Manual dimension inputs** — enter any width × thickness in mm (5–400 mm × 1–50 mm)
- **3 material grades** — Cu-ETP (99.9%), Cu-OF (99.95%), Cu-OFE (99.99%)
- **22 currencies** — USD, EUR, GBP, AED, SAR, KWD and more with live FX rates
- **Length calculator** — enter length in mm, get total weight and cost
- **Cross-section SVG diagram** — visual representation of selected dimensions
- **Public REST API** — `/api/v1/calculate` for programmatic cost calculation (see [docs/API.md](docs/API.md))
- **WordPress shortcode** — embed via `[payapress_app]` in any page
- **Standalone iframe** — `/embed` route for headless embedding

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) · React 19
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Language:** TypeScript
- **Deployment:** Netlify / Vercel

---

## Project Structure

```
payapresswebapp/
├── docs/
│   └── API.md                       # Public API reference documentation
├── frontend/                        # Next.js 15 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/copper-price/    # COMEX price endpoint (cached 5 min)
│   │   │   ├── api/fx-rate/         # FX rates (cached 6 hr)
│   │   │   ├── api/v1/calculate/    # Public REST API — busbar cost
│   │   │   ├── api/v1/copper-price/ # Public REST API — copper price proxy
│   │   │   ├── api/v1/fx-rates/     # Public REST API — FX rates proxy
│   │   │   ├── embed/               # Minimal page for iframe embedding
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── CopperCalculator.tsx  # Main interactive calculator
│   │   │   ├── Header.tsx            # Live price ticker header
│   │   │   └── ComingSoonSection.tsx
│   │   ├── lib/
│   │   │   ├── copperData.ts   # Material grades constants
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

### Internal (Next.js app)

| Route | Description | Cache |
|---|---|---|
| `GET /api/copper-price` | COMEX Cu price in USD (lb, kg, MT) | 5 min |
| `GET /api/fx-rate` | FX rates (22 currencies) per USD | 6 hr |

### Public REST API (v1)

Full documentation: **[docs/API.md](docs/API.md)**

| Route | Description |
|---|---|
| `GET /api/v1/calculate` | Copper busbar cost given width, thickness, length, grade, currency |
| `GET /api/v1/copper-price` | Live COMEX copper price (proxies internal endpoint) |
| `GET /api/v1/fx-rates` | USD-based FX rates for all supported currencies |

All v1 endpoints include `Access-Control-Allow-Origin: *` CORS headers.

**Quick example:**
```http
GET https://guileless-torrone-f24c5e.netlify.app/api/v1/calculate?width=60&thickness=8&length=6000&grade=cu-etp&currency=AED
```

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
