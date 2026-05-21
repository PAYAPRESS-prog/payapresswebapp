'use strict';
// Custom Next.js server — used by Hostinger hPanel Node.js Manager
// hPanel injects PORT via environment variable; falls back to 3000 locally

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const PORT = parseInt(process.env.PORT || '3000', 10);
const dev  = process.env.NODE_ENV !== 'production';
const app  = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`PAYAPRESS Busbar Calculator ready on port ${PORT}`);
  });
});
