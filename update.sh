#!/bin/bash
# ============================================================
#  Jerry Store — Quick Update Script
#  Run: cd /var/www/jerry && ./update.sh
# ============================================================

set -e

PROJECT_DIR="/var/www/jerry"
cd "$PROJECT_DIR"

echo ""
echo "======================================"
echo "  🔄 Jerry Store — Updating..."
echo "======================================"
echo ""

# 1. Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin master

# 2. Install any new dependencies
echo "📦 Checking dependencies..."
npm install --silent
cd server && npm install --silent && cd ..

# 3. Rebuild frontend
echo "🔨 Building frontend..."
npm run build

# 4. Restart backend (zero-downtime)
echo "🔄 Restarting backend..."
pm2 restart jerry-api

echo ""
echo "======================================"
echo "  ✅ Update Complete!"
echo "======================================"
echo ""
echo "  Website is live at: https://followerjerry.com"
echo ""
