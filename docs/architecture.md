# Architecture Overview

## System Diagram

```
                          ┌─────────────────────────────┐
                          │       User / Browser        │
                          └──────────────┬──────────────┘
                                         │ HTTPS
                          ┌──────────────▼──────────────┐
                          │     Next.js 15 App Router   │
                          │  (Netlify / Vercel / Node)  │
                          │                             │
                          │  ┌─────────┐ ┌──────────┐  │
                          │  │  Pages  │ │ API v1   │  │
                          │  │  /      │ │ /embed   │  │
                          │  └────┬────┘ └────┬─────┘  │
                          │       │           │         │
                          │  ┌────▼───────────▼─────┐  │
                          │  │  Internal API Routes  │  │
                          │  │  /api/copper-price    │  │
                          │  │  /api/fx-rate         │  │
                          │  └────┬──────────┬───────┘  │
                          └───────┼──────────┼──────────┘
                                  │          │
               ┌──────────────────┘          └──────────────────┐
               │ HTTPS (cached 5 min)               HTTPS       │
               │                              (cached 6 hours)  │
  ┌────────────▼────────────┐        ┌────────────────────────┐  │
  │   Yahoo Finance API     │        │  Frankfurter / ECB     │  │
  │  query1.finance.yahoo   │        │  api.frankfurter.app   │  │
  │  .com — COMEX HG=F      │        │  USD-based FX rates    │  │
  └─────────────────────────┘        └────────────────────────┘
```

## Request Flow

### Calculator page (`/`)

1. Client loads — React hydrates `CopperCalculator` component
2. Component fires two parallel fetches: `/api/copper-price` + `/api/fx-rate`
3. Server routes check Next.js ISR cache (5 min / 6 hr respectively)
4. On cache miss: server fetches Yahoo Finance / Frankfurter, caches response
5. Component renders live price, user adjusts dimensions + length → instant calculation (pure JS, no round-trip)
6. Currency selector changes → `fxRate` recalculated client-side from cached FX data

### Public API (`/api/v1/calculate`)

```
Client → GET /api/v1/calculate?width=60&thickness=8&length=6000&currency=AED
         │
         ├─ Validate query params (width/thickness/length ranges, grade enum, currency)
         ├─ Fetch /api/copper-price (ISR cache hit ≈0ms, miss ≈300ms)
         ├─ Fetch /api/fx-rate     (ISR cache hit ≈0ms, miss ≈200ms)
         ├─ calculateCost(size, grade, copperUSD)  — pure function, <1ms
         └─ Return JSON with CORS headers
```

## Key Modules

| Path | Responsibility |
|------|---------------|
| `frontend/src/app/page.tsx` | Root page — assembles layout, Header, CopperCalculator, ComingSoonSection |
| `frontend/src/components/CopperCalculator.tsx` | Core UI — inputs, state, result cards, currency selector |
| `frontend/src/components/BusbarRender.tsx` | SVG cross-section diagram — proportional to real mm dimensions |
| `frontend/src/lib/copperPrice.ts` | `calculateCost()` — pure deterministic calculation |
| `frontend/src/lib/copperData.ts` | Static data — material grades + densities |
| `frontend/src/types/calculator.ts` | Shared TypeScript interfaces |
| `frontend/src/app/api/copper-price/route.ts` | COMEX price fetcher (Yahoo Finance HG=F) |
| `frontend/src/app/api/fx-rate/route.ts` | ECB FX rates (Frankfurter) + Gulf pegged rates |
| `frontend/src/app/api/v1/calculate/route.ts` | Public REST API — full cost calculation |
| `frontend/src/app/embed/page.tsx` | Minimal iframe-friendly page for WordPress embed |

## Calculation Formula

```
A  (mm²)   = width × thickness
V  (cm³/m) = A                          ← mm² × m/m simplifies to cm³/m
W  (kg/m)  = V × density / 1000
C  ($/m)   = W × copper_price_per_kg
P  ($/m²)  = C / (width / 1000)
T  ($)     = C × (length_mm / 1000)
```

Densities follow IEC/EN standards: Cu-ETP 8.89, Cu-OF 8.92, Cu-OFE 8.94 g/cm³.

## Caching Strategy

| Data | TTL | Mechanism | Fallback |
|------|-----|-----------|---------|
| COMEX copper price | 5 min | Next.js `revalidate: 300` | Static estimate |
| ECB FX rates | 6 hr | Next.js `revalidate: 21600` | Static rates table |
| Gulf pegged rates | ∞ | Hardcoded constants | N/A (fixed peg) |

## Embedding

The `/embed` route renders a minimal version suitable for `<iframe>` use.
The companion WordPress plugin (`/wordpress-plugin`) provides a `[payapress_app]` shortcode
that wraps this route in a responsive iframe with admin-configurable height.

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 App Router | ISR caching for external price APIs |
| Styling | Tailwind CSS v4 | `@theme` CSS-first tokens match brand copper palette |
| Animation | Framer Motion | Spring physics, AnimatePresence, useInView |
| Busbar diagram | SVG (BusbarRender.tsx) | No Three.js overhead; proportional mm scaling via pure math |
| FX source | Frankfurter (ECB) | Free, reliable, no API key; Gulf pegs hardcoded separately |
| Price source | Yahoo Finance HG=F | Free COMEX futures; `User-Agent` header bypasses restriction |
| Deployment | Netlify (primary) | Free tier, Next.js plugin, preview deploys on PRs |
