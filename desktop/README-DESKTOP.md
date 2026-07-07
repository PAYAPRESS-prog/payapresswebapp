# Busbar Calculator — Windows app

A Tauri v2 **remote shell**: a small native window (~8 MB installed) that
loads https://calculator.payapress.com. Every web deploy updates desktop
users instantly — the shell itself rarely needs a release.

## How to release a new Windows version

1. Bump the version in BOTH files (keep them equal):
   - `desktop/VERSION`
   - `desktop/src-tauri/tauri.conf.json` → `version`
   - `desktop/src-tauri/Cargo.toml` → `version`
2. Commit, then tag and push:
   ```
   git tag desktop-v1.0.1 && git push origin desktop-v1.0.1
   ```
3. GitHub Actions (`release-windows.yml`) builds on windows-latest:
   x64 NSIS + MSI, ARM64 NSIS, SHA256SUMS — attached to the GitHub
   Release automatically. The site's /download page always points at
   `releases/latest/download/...` stable names, so it needs no change.

## Code signing (removes the SmartScreen warning)

Recommended: **Azure Trusted Signing** (cheapest maintained option) or an
OV/EV certificate. Then add two repo secrets and re-tag:
- `WINDOWS_CERT_PFX_BASE64` — the .pfx encoded with `base64 -w0 cert.pfx`
- `WINDOWS_CERT_PASSWORD`
The workflow signs every .exe/.msi with signtool + RFC3161 timestamp.
Until then, the /download page explains "More info → Run anyway" and
publishes SHA-256 checksums next to every asset.

## What the shell does

- Navigation policy: calculator.payapress.com, www.payapress.com and
  accounts.google.com render inside; anything else opens in the system
  browser (src-tauri/src/main.rs → `allowed()`).
- Single instance: a second launch focuses the existing window.
- Window state (size/position/maximised) persists between runs.
- `busbar://<path>` deep links (registered by the installer) open the
  matching page, e.g. `busbar://app/panel-cost`.
- Offline: a local branded page with Retry shows when the first load
  fails (desktop/ui/index.html); after first load the web app's own
  service worker covers soft-offline.
- First load appends `?src=windows-app` — the site persists a
  `bc_desktop` flag, hides PWA prompts and tracks `desktop_launch`.
- WebView2: `downloadBootstrapper` mode — clean Windows 10 machines get
  WebView2 installed silently by the setup.

## QA matrix before announcing a release

- [ ] Clean Windows 10 VM WITHOUT WebView2 → setup installs it silently
- [ ] Updated Windows 10 + Windows 11 (x64), Windows 11 ARM64
- [ ] Per-user install (no UAC) · silent `/S` flag · MSI via msiexec
- [ ] Upgrade over previous version keeps window size/position
- [ ] Uninstall removes Start-menu entry, app files and busbar:// handler
- [ ] Google Sign-In end-to-end inside the app
- [ ] External links (GitHub, payapress.com) open in the default browser
- [ ] Offline launch shows the branded retry page; Retry recovers
- [ ] Second launch focuses the running window; busbar://app opens the menu
- [ ] Corporate proxy: WebView2 honours system proxy settings

## Local development

```
cd desktop && npx @tauri-apps/cli@^2 dev     # needs Rust + platform deps
cargo check --manifest-path src-tauri/Cargo.toml
```
