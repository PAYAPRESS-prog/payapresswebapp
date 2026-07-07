# Busbar Calculator — iOS App (Capacitor)

The official iOS app is a **Capacitor shell**: the live site rendered
full-screen with a native splash, branded offline screen, Sign in with Apple
and universal links. Every web deploy IS an app update.

- Project: `/ios` (Capacitor root; the Xcode workspace lives at
  `ios/ios/App/App.xcworkspace`)
- Bundle ID: `com.payapress.calculator` · Launch URL:
  `https://calculator.payapress.com/busbar-calculator?src=ios-app`
- CI: `.github/workflows/release-ios.yml`, tags `ios-v*`
- Auth in the shell: **Sign in with Apple + email** (Google is hidden —
  Google blocks OAuth inside WKWebView, and guideline 4.8 requires Apple
  sign-in anyway). Backend: `/api/auth/apple`.

## 0. One-time: Apple Developer Program

1. Enroll at developer.apple.com — $99/year. Individual is fine (DUNS is
   only for organizations). Approval usually < 48h.
2. Note your **Team ID** (Membership page, 10 chars) — send it to Claude to
   fill `APPLE_TEAM_ID` (Hostinger env) so
   `/.well-known/apple-app-site-association` goes live, and to set the
   Xcode signing team.

## 1. Identifiers & Sign in with Apple (developer.apple.com → Certificates, IDs & Profiles)

1. **App ID**: Identifiers → + → App IDs → App. Bundle ID (explicit):
   `com.payapress.calculator`. Capabilities: check **Sign in with Apple** and
   **Associated Domains**. Save.
2. **Services ID** (for the WEB flow): Identifiers → + → Services IDs.
   Identifier: `com.payapress.calculator.web`. Enable Sign in with Apple →
   Configure: primary App ID = the app; domain `calculator.payapress.com`;
   return URL `https://calculator.payapress.com/busbar-calculator`.
3. **Key**: Keys → + → check Sign in with Apple → download the `.p8` ONCE.
   Note the Key ID.
4. Hostinger env panel (then Restart):
   - `APPLE_TEAM_ID` = your team id
   - `APPLE_CLIENT_ID` = `com.payapress.calculator.web`
   - `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` = from step 3 (reserved for future
     server-to-server flows; token verification itself needs no secret)
   - and bake `NEXT_PUBLIC_APPLE_CLIENT_ID=com.payapress.calculator.web`
     into `.env.production` (ask Claude) so the web button lights up.

## 2. Signing assets for CI (GitHub repo secrets)

| Secret | How to get it |
|---|---|
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect → Users and Access → Integrations → App Store Connect API → + key (role: App Manager) |
| `APP_STORE_CONNECT_ISSUER_ID` | same page, header |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | `base64 -w0 AuthKey_XXXX.p8` |
| `IOS_DIST_CERT_P12_BASE64` | Create an Apple Distribution certificate (Xcode → Settings → Accounts → Manage Certificates, or the portal), export as .p12 with a password, `base64 -w0 dist.p12` |
| `IOS_DIST_CERT_PASSWORD` | the .p12 password |
| `IOS_PROVISIONING_PROFILE_BASE64` | Portal → Profiles → + → App Store → App ID `com.payapress.calculator` + the distribution cert → download, `base64 -w0 profile.mobileprovision` |

No secrets? CI still runs an **unsigned validation archive** so the project
is always known-good.

## 3. Cutting a release

1. Bump `ios/VERSION`: `buildNumber` +1 every upload (App Store Connect
   rejects reuse); `marketingVersion` = human version.
2. Commit + push, create tag `ios-vX.Y.Z` from the GitHub UI, or run the
   **Release iOS app** workflow manually with the tag input.
3. With secrets configured the build lands in TestFlight automatically
   (processing takes ~10–30 min on Apple's side).

## 4. App Store Connect checklist (in order)

1. **Create the app**: My Apps → + → New App. Platform iOS, name
   "Busbar Calculator", language en-US, bundle ID from the picker, SKU
   `busbar-calculator-ios`.
2. **TestFlight**: internal testing (your own Apple ID — instant, no review)
   → verify the QA matrix below → external testing group (light review) and
   share the public link (also paste it into `TESTFLIGHT_URL` in
   `src/components/DownloadButtons.tsx` so /download lights up).
3. **App Privacy** (App Privacy section):
   - Contact Info → Email Address: collected, linked to identity, app
     functionality only, no tracking.
   - Identifiers → User ID: collected, linked (account id), app functionality.
   - Usage Data → Product Interaction: collected, NOT linked (first-party
     cookieless analytics), no tracking.
   - Nothing else. No IDFA → no App Tracking Transparency prompt.
4. **Account deletion**: reviewers check it — note in Review Notes that it's
   in Profile → Delete account, inside the app.
5. **Age rating**: questionnaire all "None" → 4+.
6. **App Review notes** (paste this):
   > Busbar Calculator is a professional engineering tool for electrical
   > engineers and switchgear panel builders: it sizes copper/aluminum
   > busbars and prices them with live COMEX/LME market data, computes
   > cutting waste, and imports EPLAN parts lists to cost a whole panel.
   > The app uses a hybrid architecture (Capacitor): a native shell with
   > offline handling, Sign in with Apple, haptics and share-sheet
   > integration around our continuously updated calculation engine. An
   > account is OPTIONAL (only for saving history); a demo account is
   > provided below. Account deletion: Profile → Delete account.
   Plus a demo account: create `appreview@payapress.com` with a strong
   password beforehand and paste the credentials.
7. **Listing texts** (copy-paste):
   - **Name (30)**: `Busbar Calculator`
   - **Subtitle (30)**: `Copper & aluminum, live cost`
   - **Promotional text (170)**: `Live COMEX/LME copper & aluminum prices.
     Size a busbar, get weight, ampacity and cost in 17 currencies — or
     import an EPLAN list and cost the whole panel.`
   - **Keywords (100)**: `busbar,copper,aluminum,ampacity,electrical,panel,
     switchgear,EPLAN,metal price,COMEX,LME,cost` (no spaces after commas)
   - **Description**: reuse the Google Play full description in
     `android/README-ANDROID.md` §5 (it fits Apple's format unchanged).
8. **Screenshots**: `ios/store/screenshots-6.9/` (mandatory) and
   `screenshots-6.5/` — retake against production later if you want the
   live-price badge instead of the sandbox "Estimated price" banner.
9. **Submit for review.** If rejected under 4.2.2 (web wrapper), reply via
   the Resolution Center with the review-notes text above; the documented
   phase-2 fallback is bundling the calculator UI as a static build inside
   the binary — ask Claude for "iOS phase 2".

## 5. QA matrix (before every submission)

| Check | iPhone (iOS 16) | iPhone (iOS 18) | iPad |
|---|---|---|---|
| Cold start → splash → app, no white flash | | | |
| Sign in with Apple completes; account visible in profile | | | |
| Google button ABSENT in the shell, email login works | | | |
| Airplane-mode cold start → branded offline + Retry | | | |
| Universal link from Mail/Notes opens the app | | | |
| Share result opens the native share sheet | | | |
| Account deletion reachable (Profile → Delete account) | | | |

## Files

| Path | Purpose |
|---|---|
| `capacitor.config.json` | launch URL, allowNavigation, offline errorPath |
| `www/offline.html` | branded offline/retry screen (bundled) |
| `ios/App/App/App.entitlements` | Sign in with Apple + associated domains |
| `ios/App/App/Info.plist` | portrait iPhone, export-compliance exempt |
| `VERSION` | marketingVersion + buildNumber (single source) |
| `store/` | App Store screenshots (both required sizes) |
