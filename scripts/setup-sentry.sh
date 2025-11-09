#!/bin/bash
# Sentry Setup Script
# This script helps you set up Sentry error monitoring

echo "🔧 Sentry Error Monitoring Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Sentry SDK is already installed!"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Create a FREE Sentry account:"
echo "   → Open: https://sentry.io/signup/"
echo ""
echo "2. Create a new project:"
echo "   - Click 'Create Project'"
echo "   - Select 'Node.js' as the platform"
echo "   - Name it: 'automated-profit-system'"
echo "   - Click 'Create Project'"
echo ""
echo "3. Copy your DSN:"
echo "   - You'll see a DSN that looks like:"
echo "     https://abc123def456@o123456.ingest.sentry.io/7891011"
echo "   - Copy this entire URL"
echo ""
echo "4. Add to your .env file:"
echo "   SENTRY_DSN=your_copied_dsn_here"
echo ""
echo "5. Restart your server:"
echo "   npm start"
echo ""
echo "6. Test error tracking:"
echo "   curl http://localhost:3000/api/test-sentry-error"
echo ""
echo "   Then check your Sentry dashboard!"
echo ""
echo "📚 Full guide: docs/ERROR_MONITORING_SETUP.md"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your SENTRY_DSN"
else
    echo "✅ .env file exists"

    # Check if SENTRY_DSN is already set
    if grep -q "SENTRY_DSN=" .env; then
        if grep -q "SENTRY_DSN=your_sentry_dsn_here" .env || grep -q "SENTRY_DSN=$" .env; then
            echo "⚠️  SENTRY_DSN not configured yet"
            echo "   Add your DSN to .env file"
        else
            echo "✅ SENTRY_DSN is configured!"
        fi
    else
        echo "⚠️  SENTRY_DSN not found in .env"
        echo "   Add this line: SENTRY_DSN=your_dsn_here"
    fi
fi

echo ""
echo "🚀 Ready to set up Sentry?"
echo "   Visit: https://sentry.io/signup/"
echo ""
