#!/bin/bash

# Vercel Deployment Checklist & Guide
# Run this to ensure everything is ready before deploying

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║         🚀 VERCEL DEPLOYMENT CHECKLIST & READINESS CHECK           ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall readiness
all_ready=true

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PRE-DEPLOYMENT CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Vercel CLI installed
echo -n "1. Vercel CLI installed... "
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    vercel --version
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Install with: npm install -g vercel"
    all_ready=false
fi
echo ""

# Check 2: Vercel login status
echo -n "2. Vercel authentication... "
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    vercel whoami
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Login with: vercel login"
    all_ready=false
fi
echo ""

# Check 3: Git repository status
echo -n "3. Git repository clean... "
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Working directory clean"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   Uncommitted changes detected"
    git status --short
fi
echo ""

# Check 4: Environment file exists
echo -n "4. Environment configuration... "
if [ -f .env ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   .env file found (local development)"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   No .env file (use Vercel dashboard for production vars)"
fi
echo ""

# Check 5: Required files
echo "5. Required Vercel files..."
required_files=("vercel.json" ".vercelignore" "package.json" "src/server.js")
for file in "${required_files[@]}"; do
    echo -n "   - $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        all_ready=false
    fi
done
echo ""

# Check 6: Node modules
echo -n "6. Dependencies installed... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   node_modules directory exists"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Run: npm install"
    all_ready=false
fi
echo ""

# Check 7: Database initialization
echo -n "7. Database schemas... "
schemas=("database-schema-payments.sql" "database-schema-onboarding.sql" "database-schema-multi-tenant.sql")
schema_count=0
for schema in "${schemas[@]}"; do
    if [ -f "$schema" ]; then
        ((schema_count++))
    fi
done
if [ $schema_count -eq ${#schemas[@]} ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   All schema files present"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   $schema_count/${#schemas[@]} schema files found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT NOTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Database Requirements:"
echo "   • SQLite works for LOCAL development only"
echo "   • Vercel requires a CLOUD database (PostgreSQL recommended)"
echo "   • Create database: https://vercel.com/dashboard → Storage → Postgres"
echo "   • Add POSTGRES_URL to Vercel environment variables"
echo ""
echo "📌 Environment Variables Needed in Vercel:"
echo "   Required:"
echo "   • STRIPE_SECRET_KEY"
echo "   • STRIPE_WEBHOOK_SECRET"
echo "   • OPENAI_API_KEY"
echo "   • PRINTFUL_API_KEY"
echo "   • SMTP_HOST, SMTP_USER, SMTP_PASS"
echo ""
echo "   Optional (for cloud database):"
echo "   • POSTGRES_URL (or SUPABASE_URL, MONGODB_URI, etc.)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYMENT COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Login to Vercel:"
echo "   vercel login"
echo ""
echo "Deploy to preview (testing):"
echo "   vercel"
echo ""
echo "Deploy to production:"
echo "   vercel --prod"
echo ""
echo "Or use npm scripts:"
echo "   npm run deploy:preview    # Preview deployment"
echo "   npm run deploy            # Production deployment"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 HELPFUL RESOURCES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Quick Deploy Guide:    QUICK-DEPLOY.md"
echo "📖 Full Deployment Guide: VERCEL-DEPLOYMENT.md"
echo "📖 All Features:          ALL-PHASES-COMPLETE.md"
echo "📖 Environment Config:    .env.example"
echo ""

if [ "$all_ready" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ SYSTEM READY FOR DEPLOYMENT!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "1. Run: vercel login (if not already logged in)"
    echo "2. Run: vercel --prod (for production deployment)"
    echo "3. Configure environment variables in Vercel dashboard"
    echo "4. Set up cloud database (see VERCEL-DEPLOYMENT.md)"
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}⚠️  ISSUES DETECTED - Please fix before deploying${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

echo ""
echo "For detailed deployment instructions, see:"
echo "   cat VERCEL-DEPLOYMENT.md"
echo ""
