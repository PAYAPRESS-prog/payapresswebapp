# Busbar Calculator — Android App (TWA)

The official Android app is a **Trusted Web Activity**: the live site running
in the user's Chrome, full-screen, with the Busbar identity. No WebView, no
duplicated code — every web deploy IS an app update.

- Project: this folder (`/android`), plain Gradle, `com.google.androidbrowserhelper` 2.6.2
- applicationId: `com.payapress.calculator`
- Launch URL: `https://calculator.payapress.com/busbar-calculator?src=android-app`
- CI: `.github/workflows/release-android.yml`, tags `android-v*`
- Release artifacts (stable names, the /download page depends on them):
  `Busbar-Calculator.apk` (direct download) · `Busbar-Calculator.aab` (Google Play) · `SHA256SUMS-android.txt`

---

## 1. One-time: create the upload keystore (LOCAL machine, never commit)

```bash
keytool -genkeypair -v \
  -keystore busbar-upload.keystore \
  -alias busbar \
  -keyalg RSA -keysize 2048 -validity 9125 \
  -storepass 'CHOOSE_STORE_PASSWORD' -keypass 'CHOOSE_KEY_PASSWORD' \
  -dname "CN=Busbar Calculator, O=Payapress, C=AE"
```

Store the file + both passwords in your password manager. Losing the upload
key means a Play support ticket to reset it; losing it before Play enrollment
means a new applicationId.

Extract the SHA-256 fingerprint (needed for assetlinks.json):

```bash
keytool -list -v -keystore busbar-upload.keystore -alias busbar \
  -storepass 'CHOOSE_STORE_PASSWORD' | grep 'SHA256:'
```

Add the four GitHub repo secrets (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 busbar-upload.keystore` output |
| `ANDROID_KEYSTORE_PASSWORD` | store password |
| `ANDROID_KEY_ALIAS` | `busbar` |
| `ANDROID_KEY_PASSWORD` | key password |

## 2. Wire Digital Asset Links (removes the URL bar)

Edit `public/.well-known/assetlinks.json`: replace the placeholder with the
SHA-256 from step 1 (colon-separated uppercase). Deploy the site. Verify:

```
https://calculator.payapress.com/.well-known/assetlinks.json   → HTTP 200, JSON
https://developers.google.com/digital-asset-links/tools/generator  (checker)
```

⚠️ **After the first Play upload** Google re-signs the app (Play App Signing).
Copy the **App signing key certificate → SHA-256** from Play Console →
Test and release → App integrity, and ADD it as a **second** entry in the
`sha256_cert_fingerprints` array (keep the upload key too), then redeploy the
site. Do this BEFORE promoting past internal testing or the Play build shows
the URL bar. A unit test (`src/lib/__tests__/assetlinks.test.ts`) guards the
file format.

## 3. Cutting a release

1. Bump `android/VERSION`: `versionCode` +1 (Play rejects reuse, forever),
   `versionName` = human version (e.g. 1.1.0).
2. Commit + push, then create tag `android-vX.Y.Z` from the GitHub UI
   (Releases → Draft new release → new tag on the deploy branch), or run the
   **Release Android app** workflow manually with the tag input.
3. CI attaches the APK + AAB + checksums to the release. The /download page
   picks up the newest `android-v*` tag automatically.

## 4. Google Play Console checklist (in order)

1. **Account**: play.google.com/console → one-time $25. Personal accounts:
   ⚠️ Google requires a **closed test with at least 12 testers opted-in for
   14 consecutive days** before you can apply for production access. Plan for it
   (colleagues/friends; share the opt-in link from the Closed testing track).
2. **Create app**: name "Busbar Calculator", default language en-US, App,
   Free. Declarations: not a news app, no ads.
3. **App content** (Policy → App content, all forms):
   - Privacy policy URL: `https://calculator.payapress.com/privacy`
   - App access: "All functionality is available without special access" —
     but provide a demo account if reviewers ask about sign-in features.
   - Ads: **No ads**.
   - Content rating questionnaire: Utility → answers all "No" → **Everyone**.
   - Target audience: 18 and over (not designed for children).
   - Data safety:
     - Collected: **Email address + name** (optional account sign-in; account
       management) — encrypted in transit, deletable on request (profile →
       delete account), not shared with third parties.
     - Analytics: first-party, cookieless, no device identifiers → declare
       "App activity: app interactions" collected, not linked to identity,
       not shared.
     - No location, no financial data, no advertising ID.
4. **Internal testing** first: upload `Busbar-Calculator.aab`, add your own
   email as tester, install from the opt-in link, verify: no URL bar (after
   step 2's SECOND fingerprint), Google Sign-In, offline launch, back gesture.
5. **Closed testing**: promote the same build, add ≥12 testers, run 14 days.
6. **Store listing** (texts below, graphics in `android/store/`):
   - App icon: `store/play-icon-512.png`
   - Feature graphic: `store/feature-graphic-1024x500.png`
   - Phone screenshots: `store/screenshots/*.png` (4 provided; they were
     captured in a sandbox, so the results screen shows the amber
     "Estimated price" fallback badge — optionally retake that one against
     the live site when the real feed is up)
7. **Production**: apply for production access (personal accounts), roll out.

## 5. Store listing texts (copy-paste)

**Title (30 chars max):**
```
Busbar Calculator
```

**Short description (80 chars max):**
```
Copper & aluminum busbar cost with live prices — weight, ampacity, EPLAN.
```

**Full description:**
```
Busbar Calculator prices copper and aluminum busbars in seconds — with real
live market data, not yesterday's numbers.

• Live COMEX copper and LME aluminum prices, refreshed continuously
• Busbar weight, ampacity and total cost from your exact dimensions
• IEC standard cross-sections and material grades (Cu-ETP, alloys)
• 17 currencies with live FX conversion — or enter your own rates
• Historical price chart up to one year
• Waste calculator: blade kerf loss per cut and punch-out slugs, priced
• Electrical panel busbar cost from an EPLAN parts list: import the CSV/XLSX
  export, map columns automatically (German or English headers), subtract
  kerf, offcut and punch waste, and get the true panel copper cost
• Save configurations, compare them, and get a daily price digest by email
• Free account sync — your history is the same on Android, Windows and web

Built for electrical engineers, switchgear panel builders, estimators and
procurement teams who buy the metal they quote.

The app is a lightweight shell around the live product, so every improvement
ships to you instantly — no updates to babysit.
```

## 6. QA matrix (before every Play promotion)

| Check | Android 10 | 13 | 15 |
|---|---|---|---|
| Cold start → splash → app, no URL bar | | | |
| Google Sign-In completes | | | |
| Airplane-mode cold start → branded offline page | | | |
| Back gesture: sheets close, root exits | | | |
| App link: tapping a calculator.payapress.com link opens the app | | | |
| Device without Chrome (or Chrome disabled) → Custom Tab fallback | | | |

## Files

| Path | Purpose |
|---|---|
| `app/src/main/AndroidManifest.xml` | TWA LauncherActivity, App Links, splash config |
| `app/src/main/res/values/strings.xml` | launch URL + asset_statements |
| `app/build.gradle` | version from `VERSION`, signing from env |
| `VERSION` | single source of versionCode/versionName |
| `store/` | Play listing graphics + screenshots |
