# Architecture Overview

## High-Level Design

```
Browser
  │
  ▼
┌─────────────────────┐
│  Next.js Frontend   │  ← static/SSR pages, client components
│  (Vercel / Docker)  │
└────────┬────────────┘
         │  HTTPS / REST
         ▼
┌─────────────────────┐
│  WordPress REST API │  ← /wp-json/wp/v2/*
│  + PAYAPRESS Plugin │  ← /wp-json/payapress/v1/*
│  (wp-content/       │
│   plugins/payapress)│
└─────────────────────┘
```

## Data Flow

1. The Next.js app fetches content from WordPress REST API at build time (SSG) or request time (SSR/ISR).
2. The PAYAPRESS plugin extends the REST API with custom endpoints.
3. CORS headers are configured via the plugin settings page to allow the frontend origin.
4. Authentication uses WordPress Application Passwords (future: JWT).

## Key Directories

| Path | Purpose |
|---|---|
| `frontend/src/lib/wordpress.ts` | Server-side WordPress API fetcher |
| `frontend/src/hooks/usePosts.ts` | Client-side hook (via proxy rewrite) |
| `frontend/src/types/wordpress.ts` | Shared TypeScript types |
| `wordpress-plugin/includes/` | PHP backend classes |

## Future Considerations

- **Authentication**: Add JWT support or OAuth2 for protected routes
- **Caching**: ISR (Incremental Static Regeneration) + on-demand revalidation webhook
- **WooCommerce**: Extend plugin with WC REST API endpoints
- **Deployment**: Docker Compose for local full-stack dev
