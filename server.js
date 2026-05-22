'use strict';
// Custom Next.js server — used by Hostinger hPanel Node.js Manager
// hPanel injects PORT via environment variable; falls back to 3000 locally

// Force production mode — never rely on the host setting NODE_ENV correctly
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
const next = require('next');

const PORT = parseInt(process.env.PORT || '3000', 10);

// Always production — development mode breaks static file serving
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Verify a complete production build exists (BUILD_ID is written last by next build)
const buildDir  = path.join(__dirname, '.next');
const buildIdFile = path.join(buildDir, 'BUILD_ID');
if (!fs.existsSync(buildIdFile)) {
  console.error('[PAYAPRESS] FATAL: No BUILD_ID found in .next/');
  console.error('[PAYAPRESS] The .next directory exists but the build is incomplete or missing.');
  console.error('[PAYAPRESS] Run "npm run build" before starting the server.');
  process.exit(1);
}

// Log startup diagnostics
console.log('[PAYAPRESS] Starting server...');
console.log('[PAYAPRESS] NODE_ENV =', process.env.NODE_ENV);
console.log('[PAYAPRESS] PORT =', PORT);
console.log('[PAYAPRESS] BUILD_ID =', fs.readFileSync(buildIdFile, 'utf8').trim());

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error('[PAYAPRESS] Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`[PAYAPRESS] Ready on http://0.0.0.0:${PORT} (production mode)`);
  });
}).catch(err => {
  console.error('[PAYAPRESS] FATAL: app.prepare() failed:', err);
  process.exit(1);
});
