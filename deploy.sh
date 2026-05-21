#!/bin/bash
set -e
echo "=== PAYAPRESS — Deploy ==="
git pull origin main
npm install --omit=dev
npm run build
echo "=== Build complete — restart Node.js app in hPanel ==="
