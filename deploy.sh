#!/bin/bash
# ── PAYAPRESS — Hostinger deploy / update script ──────────────────────────────
# Run this on the Hostinger server after SSH login:
#   bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ""
echo "===  PAYAPRESS Busbar Calculator — Deploy  ==="
echo ""

# Pull latest code
git pull origin main

# Go into the Next.js app
cd frontend

# Install dependencies (skip dev tools)
npm install --omit=dev

# Build for production
npm run build

echo ""
echo "=== Build complete ==="
echo ""
echo "Next step: restart the Node.js app in Hostinger hPanel"
echo "  hPanel → Node.js → payapress-calc → Restart"
echo ""
