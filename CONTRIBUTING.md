# Contributing to Busbar Calculator

Thanks for your interest! Issues and pull requests are welcome.

## Ground rules

- Be respectful and constructive.
- Bugs → **Bug report** template · ideas → **Feature request** template.
- Security problems → **never** a public issue; see [SECURITY.md](SECURITY.md).

## Repository layout & branches

- This is a monorepo: `src/` (Next.js web app), `desktop/` (Tauri Windows),
  `android/` (TWA), `ios/` (Capacitor), `docs/`.
- **`claude/payapress-webapp-setup-0bjxA` is the default AND deploy branch**
  (a hosting auto-deploy hook is tied to its name — do not rename it).
  Build artifacts in `.next/` are committed on purpose for this reason.
- Base your PRs on the default branch.

## Development

```bash
npm install
npm run dev          # http://localhost:3000 — runs with zero env config
npm run build        # must stay clean
npm test             # unit tests (Jest)
npm run test:smoke   # component smoke tests (jsdom)
./node_modules/.bin/tsc --noEmit   # typecheck (use the local binary, not bare npx)
```

Conventions that will save you review round-trips:

- **Never change calculation formulas** (weight, kerf, punch, packing) —
  they are frozen and documented in the whitepaper.
- Bump the service-worker `CACHE_VERSION` (`public/sw.js`) in any PR that
  changes CSS/JS delivered to the browser.
- All DB writes / email sends inside API routes must be **awaited before
  the response** (Passenger hosting freezes the process afterwards).
- Keep secrets out of the repo — env names may appear in docs, values never.
- Commit style: `type(scope): summary` (`feat`, `fix`, `chore`, `docs`, `seo`).

## Releases

Handled by maintainers: platform tags `desktop-v*` / `android-v*` / `ios-v*`
are created from the GitHub UI and CI builds + attaches the artifacts.
Bump the matching `VERSION` file in the same PR as shell changes.

## Pull requests

1. Fork → branch → focused change (one concern per PR).
2. `npm run build` + both test suites green locally.
3. Fill in the PR template checklist.
4. A maintainer reviews; CI must pass before merge.
