#!/bin/bash
# Add Environment Variables to Vercel
# This script helps you add environment variables using Vercel CLI

echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
echo ""
echo "This script will help you add environment variables to Vercel."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# Login check
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "Run: vercel login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Project directory
cd "$(dirname "$0")/.." || exit

echo "📋 Adding REQUIRED environment variables..."
echo ""

# Add JWT_SECRET
echo "Adding JWT_SECRET..."
vercel env add JWT_SECRET production <<< "f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a"
vercel env add JWT_SECRET preview <<< "f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a"
vercel env add JWT_SECRET development <<< "f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a"

# Add NODE_ENV
echo "Adding NODE_ENV..."
vercel env add NODE_ENV production <<< "production"
vercel env add NODE_ENV preview <<< "production"
vercel env add NODE_ENV development <<< "development"

# Add ALLOWED_ORIGINS
echo "Adding ALLOWED_ORIGINS..."
vercel env add ALLOWED_ORIGINS production <<< "https://automated-profit-system.vercel.app"
vercel env add ALLOWED_ORIGINS preview <<< "https://automated-profit-system.vercel.app"
vercel env add ALLOWED_ORIGINS development <<< "http://localhost:3000,http://localhost:5173"

echo ""
echo "✅ Required environment variables added!"
echo ""
echo "📝 Optional: Add these when ready:"
echo "   - SENTRY_DSN (error monitoring)"
echo "   - PRINTFUL_API_KEY (product automation)"
echo "   - STRIPE_API_KEY (payments)"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: vercel --prod"
echo "   2. Or redeploy from Vercel dashboard"
echo ""
