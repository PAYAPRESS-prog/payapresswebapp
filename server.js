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

// Verify the .next build directory exists before starting
const buildDir = path.join(__dirname, '.next');
if (!fs.existsSync(buildDir)) {
  console.error('[PAYAPRESS] FATAL: .next build directory not found at', buildDir);
  console.error('[PAYAPRESS] Run "npm run build" before starting the server');
  process.exit(1);
}

// Log startup diagnostics
console.log('[PAYAPRESS] Starting server...');
console.log('[PAYAPRESS] NODE_ENV =', process.env.NODE_ENV);
console.log('[PAYAPRESS] PORT =', PORT);
console.log('[PAYAPRESS] __dirname =', __dirname);
console.log('[PAYAPRESS] .next exists =', fs.existsSync(buildDir));

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
