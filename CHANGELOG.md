# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- **Full responsive redesign** — all standard screen sizes from 320 px mobile to 1920 px+ desktop
- **Desktop 2-column layout** — configurator card (left) + results sticky card (right) on `lg+` screens
- **Coming Soon section** — reduced to 3 cards (removed Multi-Currency, Project Estimator, Custom Profiles)
- **Header** — matches main container breakpoints; shows tagline on `md+` screens
- **Field inputs** — 16 px font-size prevents iOS Safari auto-zoom on focus; 44 px min-height (WCAG 2.5.5)
- **Touch hover** — `@media (hover: none)` disables sticky hover lift on touch devices
- **iOS safe-area** — `env(safe-area-inset-bottom)` applied to footer and html base
- **Reduced motion** — `prefers-reduced-motion: reduce` disables all animations
- **Number spinner controls** — removed native spinners globally on number inputs
- **Results layout** — removed static "Per Metre" row; single result block keyed to entered length

### Added
- **Gamification** — drag-to-resize busbar viewer, quick IEC preset chips, achievement badges,
  confetti burst, calc counter (#N), milestone toasts, copper price mood indicator

---

## [1.0.0] — 2025-05-20

### Added
- **Public REST API v1** — `GET /api/v1/calculate`, `/api/v1/copper-price`, `/api/v1/fx-rates`
  with full CORS support (`Access-Control-Allow-Origin: *`) and structured JSON responses
- **Manual dimension inputs** — user enters busbar width × thickness in mm directly (replaces preset dropdown)
- **Manual length input** — user enters length in mm; total weight and cost calculated automatically
- **Searchable currency dropdown** — custom `CurrencySelector` component with flag images (flagcdn.com), live search filter, and AnimatePresence animation
- **22 currencies** — USD, EUR, GBP, CHF, JPY, CAD, AUD, AED, SAR, KWD, QAR, BHD, CNY, INR, SGD, KRW, TRY, BRL, MXN, NOK, SEK, ZAR
- **Gulf pegged currencies** — AED, SAR, QAR, KWD, BHD with fixed central-bank peg rates
- **Proportional busbar SVG** — cross-section diagram scales so pixel W:H ratio exactly matches real mm dimensions
- **Auto locale detection** — calculator defaults to user's local currency based on `navigator.language`
- **`docs/API.md`** — complete public API reference with parameter tables, example request/response, and calculation formula
- **`docs/architecture.md`** — technical architecture overview with system diagram, data flow, and technology decisions
- **`SECURITY.md`** — responsible disclosure policy
- **`.editorconfig`** — consistent editor settings across all contributors

### Changed
- FX rates source upgraded to **Frankfurter (ECB)** — free, reliable, no API key required
- Copper price source: **COMEX HG=F via Yahoo Finance** cached 5 minutes server-side
- Header: live price ticker removed; clean PAYAPRESS + PRO badge only
- Hero section: simplified to two-line heading + three animated feature pills (no verbose subtitle)
- `body` `overflow-x: hidden` removed — was breaking `position: sticky` on iOS Safari
- Header moved outside `overflow` container — fixes sticky positioning on all browsers

### Removed
- Three.js / `@react-three/fiber` / `@react-three/drei` dependencies (replaced by SVG diagram)
- `BusbarScene.tsx` — unused Three.js component
- `wordpress.ts`, `usePosts.ts`, `wordpress.types.ts` — unused WordPress integration stubs
- Busbar size preset dropdown
- Quantity meter presets (1m, 5m, 10m, 50m, 100m buttons)
- Price ticker from header top-right

### Fixed
- `fmtCurrency` TypeScript error — `symbol === code` comparison had no type overlap with `as const` unions
- Volume hint formula — was dividing by 1000 twice (`W × T × L_m / 1000` → `W × T × L_m`)
- Copy-to-clipboard text now shows length in mm, not meters

---

## [0.3.0] — 2025-05-15

### Added
- Photorealistic copper busbar SVG renderer with multi-face shading, ambient glow, and edge highlights
- 3D tilt card effect on main calculator (mouse-tracking spring rotation via Framer Motion)
- Scroll-reveal entrance animation (`useInView`)
- Animated number transitions on result cards (`easeOutCubic` RAF loop)
- `viewer-bg` studio lighting gradient for busbar display area
- Copper-themed custom scrollbar

### Changed
- Three.js busbar replaced with hand-crafted SVG for faster load and no WebGL requirement
- Result cards redesigned with copper glow pulse animation on highlighted card

---

## [0.2.0] — 2025-05-10

### Added
- Multi-currency support (USD, EUR, GBP, AED) with live FX rates
- Quantity selector with presets (1m, 5m, 10m, 50m, 100m) and custom input
- Three material grades: Cu-ETP, Cu-OF, Cu-OFE with IEC/EN densities
- Copy-to-clipboard results button
- WordPress companion plugin with `[payapress_app]` shortcode
- `/embed` route for standalone iframe embedding
- Netlify and Vercel deployment configuration
- GitHub Actions CI workflow (type-check, lint, build)
- Issue templates (Bug Report, Feature Request) and PR template

### Changed
- Calculator moved to card layout with `card-copper` dark glass style

---

## [0.1.0] — 2025-05-01

### Added
- Initial Next.js 15 project scaffold with TypeScript and Tailwind CSS v4
- Basic copper busbar cost calculator (weight/m, cost/m, cost/m²)
- Live COMEX copper price via Yahoo Finance HG=F (server route, 5-min cache)
- Static fallback price when Yahoo Finance is unavailable
- `calculateCost()` pure function with unit tests
- Copper brand color palette (`--color-copper-*`) in `@theme`
- Dark surface color tokens (`--color-surface-0` through `surface-4`)

[1.0.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PAYAPRESS-prog/payapresswebapp/releases/tag/v0.1.0
