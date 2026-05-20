# PAYAPRESS-WEBAPP

> An open source web application companion for WordPress — headless frontend, REST API integration, and plugin toolkit.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/PAYAPRESS-prog/payapresswebapp)](https://github.com/PAYAPRESS-prog/payapresswebapp/issues)

---

## What is PAYAPRESS-WEBAPP?

PAYAPRESS-WEBAPP is an open source project that bridges modern web application development with WordPress. It consists of:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js + TypeScript | Headless WordPress consumer |
| **WordPress Plugin** | PHP | Custom REST API endpoints & auth |
| **Shared** | TypeScript types | Shared data contracts |

---

## Project Structure

```
payapresswebapp/
├── frontend/                  # Next.js web application
│   ├── src/
│   │   ├── app/               # App Router pages & layouts
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # API clients, utilities
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── styles/            # Global styles
│   ├── public/
│   ├── next.config.js
│   └── package.json
│
├── wordpress-plugin/          # WordPress companion plugin
│   ├── includes/              # PHP classes
│   ├── assets/                # Plugin CSS/JS
│   └── payapress-webapp.php   # Plugin entry point
│
├── docs/                      # Project documentation
├── .github/                   # CI/CD workflows & templates
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- WordPress 6.0+ site with REST API enabled
- PHP 8.0+ (for the plugin)

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your WordPress URL
npm install
npm run dev
```

### WordPress Plugin Setup

1. Copy the `wordpress-plugin/` folder to your WordPress `wp-content/plugins/` directory
2. Rename it to `payapress-webapp`
3. Activate it from the WordPress admin panel

---

## Configuration

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_WP_URL` | Your WordPress site URL | `https://mysite.com` |
| `NEXT_PUBLIC_WP_API_BASE` | WordPress REST API base | `https://mysite.com/wp-json/wp/v2` |
| `PAYAPRESS_SECRET_KEY` | Shared secret for plugin auth | `your-secret-here` |

---

## Roadmap

- [ ] Authentication (JWT / Application Passwords)
- [ ] Post/Page rendering from WordPress REST API
- [ ] Custom post type support
- [ ] Media library integration
- [ ] WooCommerce integration
- [ ] Admin dashboard
- [ ] Theme system

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](LICENSE).
