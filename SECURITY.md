# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Active  |
| < 1.0   | ❌         |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email us at **security@payapress.com** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- (Optional) a suggested fix

We will acknowledge your report within **48 hours** and aim to release a fix within **14 days** for critical issues.

## Scope

| In scope | Out of scope |
|----------|-------------|
| Injection vulnerabilities in API routes | Issues in third-party dependencies (report upstream) |
| Authentication / authorization bypasses | Theoretical issues without PoC |
| Data exposure via API | Issues only reproducible on unsupported versions |
| CORS misconfiguration | Rate limiting / availability issues |

## Responsible Disclosure

We follow a **90-day disclosure policy**. After 90 days from acknowledgement (or earlier if a fix is released), you are free to publish your findings.

We appreciate responsible disclosure and will credit reporters in the relevant release notes unless you prefer to remain anonymous.
