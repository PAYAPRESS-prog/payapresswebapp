# Security Policy

## Supported versions

| Surface | Version | Supported |
|---|---|---|
| Web app (calculator.payapress.com) | rolling | ✅ always latest |
| Windows app | ≥ 1.0.2 | ✅ (shell auto-tracks the live web app) |
| Android app | ≥ 1.0.1 | ✅ (TWA — content always latest) |
| iOS app | pre-release | ✅ once on TestFlight |
| Anything older | — | ❌ please update |

Because the native apps are thin shells around the live product, almost all
fixes ship server-side and reach every platform immediately; only
shell-level issues need a new installer.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Email **web3.payapress@gmail.com** with:

- a description of the vulnerability and the affected surface
  (web / API / Windows / Android / iOS shell),
- steps to reproduce or a proof of concept,
- the potential impact as you see it.

**Response target:** acknowledgement within 72 hours; fix or mitigation
timeline communicated within 7 days for confirmed issues.

## Scope

In scope: the web app and public API, the auth flows (OTP / Google /
Apple), the admin back-office, the Windows/Android/iOS shells (navigation
policy, deep links, asset-link verification), and the release pipelines.

Out of scope: third-party services (Yahoo Finance, Google/Apple identity),
volumetric denial-of-service, and social engineering.

## Rewards

This is a small self-funded project — there is **no paid bug bounty**.
We do gladly credit reporters in the changelog and release notes.
