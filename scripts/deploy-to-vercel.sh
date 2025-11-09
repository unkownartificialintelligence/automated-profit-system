#!/bin/bash

# Automated Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 Automated Profit System - Vercel Deployment            ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
else
    echo "✅ Vercel CLI found"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Create .env file with your API keys before deploying"
    echo "   See .env.example for required variables"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📋 Pre-Deployment Checklist:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required environment variables
required_vars=(
    "STRIPE_SECRET_KEY"
    "OPENAI_API_KEY"
    "PRINTFUL_API_KEY"
    "SMTP_USER"
    "SMTP_PASS"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env 2>/dev/null; then
        missing_vars+=("$var")
        echo "❌ Missing: $var"
    else
        echo "✅ Found: $var"
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo ""
    echo "⚠️  Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    read -p "Continue deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask deployment type
echo "Select deployment type:"
echo "1) Production deployment"
echo "2) Preview deployment (for testing)"
echo ""
read -p "Enter choice (1-2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to PRODUCTION..."
        echo ""
        vercel --prod
        ;;
    2)
        echo ""
        echo "🔍 Creating PREVIEW deployment..."
        echo ""
        vercel
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo ""
echo "📋 Post-Deployment Tasks:"
echo "1. Update Stripe webhook URL in Stripe dashboard"
echo "2. Update FRONTEND_URL environment variable in Vercel"
echo "3. Test all API endpoints"
echo "4. Verify payment processing works"
echo "5. Check email sending functionality"
echo ""
echo "📚 See VERCEL-DEPLOYMENT.md for detailed post-deployment steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
