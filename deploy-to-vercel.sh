#!/bin/bash

# Automated Profit System - Vercel Deployment Script
# This script will deploy your profit system to Vercel

set -e

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║           AUTOMATED PROFIT SYSTEM - VERCEL DEPLOYMENT                ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check authentication
echo "🔐 Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo "✅ Authenticated as: $VERCEL_USER"
else
    echo "❌ Not authenticated with Vercel"
    echo ""
    echo "Please authenticate with Vercel:"
    echo "  vercel login"
    echo ""
    echo "After authentication, run this script again."
    exit 1
fi

# Check git status
echo ""
echo "🔧 Checking Git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes detected. Committing..."
    git add .
    git commit -m "Pre-deployment commit $(date +'%Y-%m-%d %H:%M:%S')"
    git push
    echo "✅ Changes committed and pushed"
else
    echo "✅ Git working tree is clean"
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
cd ..
echo "✅ Frontend built successfully"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Set environment variables during deployment
vercel --prod \
  --name automated-profit-system \
  --env NODE_ENV=production \
  --env JWT_SECRET=jerzii-automated-profit-system-secret-key-2025-production \
  --env PORT=3003

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOYMENT COMPLETE!                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your automated profit system is now live!"
echo ""
echo "Next steps:"
echo "  1. Visit your deployment URL (shown above)"
echo "  2. Go to /admin to access the dashboard"
echo "  3. Login with: admin@jerzii.ai / admin123"
echo "  4. Monitor your profits 24/7!"
echo ""
echo "📊 Your system will automatically:"
echo "  • Analyze trends every 6 hours"
echo "  • Process email marketing every 5 minutes"
echo "  • Generate and track profits continuously"
echo ""
