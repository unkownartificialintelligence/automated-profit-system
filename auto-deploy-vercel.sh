#!/bin/bash

# ========================================
# FULLY AUTOMATED VERCEL DEPLOYMENT
# ========================================

echo "🚀 DEPLOYING TO VERCEL AUTOMATICALLY"
echo "========================================"
echo ""

# Set working directory
cd /home/user/automated-profit-system

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Pre-deployment checks
echo "📋 Pre-deployment checks:"
echo ""

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check vercel.json
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found"
else
    echo "❌ vercel.json not found"
    exit 1
fi

# Check frontend
if [ -d "frontend" ]; then
    echo "✅ frontend directory found"
else
    echo "❌ frontend directory not found"
    exit 1
fi

# Check server
if [ -f "src/server.js" ]; then
    echo "✅ src/server.js found"
else
    echo "❌ src/server.js not found"
    exit 1
fi

echo ""
echo "========================================"
echo "🎯 DEPLOYMENT OPTIONS"
echo "========================================"
echo ""
echo "IMPORTANT: To deploy, you need to authenticate with Vercel"
echo ""
echo "Choose deployment method:"
echo ""
echo "1. Interactive Deployment (Browser login required)"
echo "   - Opens browser for login"
echo "   - Fully automated after login"
echo "   - Recommended for first time"
echo ""
echo "2. Manual Instructions"
echo "   - Shows step-by-step commands"
echo "   - You run each command"
echo ""
echo "3. Deploy with Token (If you have Vercel token)"
echo "   - Uses VERCEL_TOKEN environment variable"
echo "   - Fully automated, no browser needed"
echo ""

read -p "Select option (1-3): " option

case $option in
    1)
        echo ""
        echo "🌐 INTERACTIVE DEPLOYMENT"
        echo "========================================"
        echo ""
        echo "This will:"
        echo "  1. Open your browser to login to Vercel"
        echo "  2. Link/create project"
        echo "  3. Deploy to preview"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "Step 1: Logging in to Vercel..."
            echo "(Browser will open)"
            echo ""

            vercel login

            echo ""
            echo "Step 2: Deploying to preview..."
            echo ""
            echo "When prompted:"
            echo "  • Set up and deploy? → Yes"
            echo "  • Which scope? → Select your account"
            echo "  • Link to existing project? → No (first time)"
            echo "  • Project name? → automated-profit-system"
            echo "  • Directory? → ./ (just press Enter)"
            echo ""

            vercel

            echo ""
            echo "🎉 DEPLOYMENT COMPLETE!"
            echo ""
            echo "⚠️  IMPORTANT: Add environment variables"
            echo ""
            echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
            echo "2. Select: automated-profit-system"
            echo "3. Settings → Environment Variables"
            echo "4. Add: PRINTFUL_API_KEY = your_key_here"
            echo "5. Redeploy: vercel --prod"
            echo ""
        fi
        ;;

    2)
        echo ""
        echo "📝 MANUAL DEPLOYMENT INSTRUCTIONS"
        echo "========================================"
        echo ""
        echo "Run these commands in order:"
        echo ""
        echo "1. Login to Vercel:"
        echo "   vercel login"
        echo ""
        echo "2. Deploy to preview:"
        echo "   cd /home/user/automated-profit-system"
        echo "   vercel"
        echo ""
        echo "3. Test the preview URL"
        echo ""
        echo "4. Add environment variables in Vercel Dashboard:"
        echo "   https://vercel.com/dashboard"
        echo "   Settings → Environment Variables"
        echo "   Add: PRINTFUL_API_KEY=your_key"
        echo ""
        echo "5. Deploy to production:"
        echo "   vercel --prod"
        echo ""
        echo "6. Test production URL"
        echo ""
        ;;

    3)
        echo ""
        echo "🔑 TOKEN-BASED DEPLOYMENT"
        echo "========================================"
        echo ""

        if [ -z "$VERCEL_TOKEN" ]; then
            echo "❌ VERCEL_TOKEN environment variable not set"
            echo ""
            echo "To get a token:"
            echo "1. Go to: https://vercel.com/account/tokens"
            echo "2. Create new token"
            echo "3. Set environment variable:"
            echo "   export VERCEL_TOKEN=your_token_here"
            echo "4. Run this script again"
            echo ""
        else
            echo "✅ VERCEL_TOKEN found"
            echo ""
            echo "Deploying with token..."
            echo ""

            # Deploy with token
            vercel --token="$VERCEL_TOKEN" --confirm

            echo ""
            echo "🎉 DEPLOYMENT COMPLETE!"
            echo ""
        fi
        ;;

    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "📊 POST-DEPLOYMENT CHECKLIST"
echo "========================================"
echo ""
echo "After deployment:"
echo ""
echo "✓ Test API:"
echo "  curl https://your-url.vercel.app/api/health"
echo ""
echo "✓ Test Frontend:"
echo "  Open: https://your-url.vercel.app"
echo ""
echo "✓ Add Environment Variables:"
echo "  Vercel Dashboard → Settings → Environment Variables"
echo "  Required: PRINTFUL_API_KEY"
echo ""
echo "✓ Deploy to Production:"
echo "  vercel --prod"
echo ""
echo "✓ Set up custom domain (optional):"
echo "  Vercel Dashboard → Settings → Domains"
echo ""
echo "========================================"
echo ""
echo "📚 Documentation:"
echo "  • VERCEL_DEPLOYMENT.md - Full guide"
echo "  • VERCEL_QUICK_START.txt - Quick reference"
echo ""
echo "Need help? Check the docs above!"
echo ""
