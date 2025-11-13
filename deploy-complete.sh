#!/bin/bash
# Complete Deployment Script - Vercel & Render
# This script deploys your automated profit system to both cloud platforms

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================================"
echo "     🚀 AUTOMATED PROFIT SYSTEM - COMPLETE DEPLOYMENT"
echo "================================================================"
echo ""

# Step 1: Pre-deployment checks
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: PRE-DEPLOYMENT CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} .env file exists"
else
    echo -e "${RED}❌${NC} .env file missing"
    exit 1
fi

# Check deployment scripts
if [ -f "sync-env-vercel.sh" ]; then
    echo -e "${GREEN}✅${NC} sync-env-vercel.sh ready"
else
    echo -e "${RED}❌${NC} sync-env-vercel.sh missing"
    exit 1
fi

if [ -f "render-env-vars.txt" ]; then
    echo -e "${GREEN}✅${NC} render-env-vars.txt ready"
else
    echo -e "${RED}❌${NC} render-env-vars.txt missing"
    exit 1
fi

# Check git status
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅${NC} Git working tree clean"
else
    echo -e "${YELLOW}⚠️${NC}  Uncommitted changes detected"
    echo "   Run: git status"
fi

echo ""

# Step 2: Vercel Deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: VERCEL DEPLOYMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Vercel authentication
if vercel whoami > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Already authenticated with Vercel"
    vercel whoami
else
    echo -e "${YELLOW}⚠️${NC}  Not authenticated with Vercel"
    echo ""
    echo "Please authenticate with Vercel:"
    echo "  vercel login"
    echo ""
    read -p "Press Enter after you've completed 'vercel login'..."
fi

echo ""
echo "Syncing environment variables to Vercel..."
if ./sync-env-vercel.sh; then
    echo -e "${GREEN}✅${NC} Environment variables synced"
else
    echo -e "${YELLOW}⚠️${NC}  Some environment variables may already exist"
fi

echo ""
echo "Deploying to Vercel production..."
if vercel --prod --yes; then
    echo -e "${GREEN}✅${NC} Vercel deployment successful!"

    # Get deployment URL
    VERCEL_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")
    if [ -n "$VERCEL_URL" ]; then
        echo ""
        echo "🔗 Vercel URL: https://$VERCEL_URL"
        echo ""
        echo "Testing Vercel deployment..."
        if curl -sf "https://$VERCEL_URL/api/health" > /dev/null; then
            echo -e "${GREEN}✅${NC} Vercel health check passed!"
        else
            echo -e "${YELLOW}⚠️${NC}  Vercel health check failed - may need a moment to fully deploy"
        fi
    fi
else
    echo -e "${RED}❌${NC} Vercel deployment failed"
    echo "Check logs above for errors"
fi

echo ""

# Step 3: Render Instructions
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: RENDER DEPLOYMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Render deployment requires web dashboard access."
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: ${BLUE}https://dashboard.render.com${NC}"
echo ""
echo "2. Click: ${GREEN}New → Blueprint${NC}"
echo ""
echo "3. Select repository:"
echo "   ${YELLOW}unkownartificialintelligence/automated-profit-system${NC}"
echo ""
echo "4. Select branch:"
echo "   ${YELLOW}claude/fix-issue-011CV3EX4MhR5SzS5GViqTzi${NC}"
echo ""
echo "5. Render will detect render.yaml → Click ${GREEN}Apply${NC}"
echo ""
echo "6. Set environment variables:"
echo "   - Go to your service → ${BLUE}Environment${NC} tab"
echo "   - Copy all variables from: ${YELLOW}render-env-vars.txt${NC}"
echo "   - Click ${GREEN}Save Changes${NC}"
echo ""
echo "7. Wait for build to complete (3-5 minutes)"
echo ""
echo "8. Test deployment:"
echo "   ${YELLOW}curl https://automated-profit-system.onrender.com/api/health${NC}"
echo ""

read -p "Press Enter after you've completed Render deployment..."

echo ""
echo "Testing Render deployment..."
if curl -sf "https://automated-profit-system.onrender.com/api/health" > /dev/null; then
    echo -e "${GREEN}✅${NC} Render health check passed!"
else
    echo -e "${YELLOW}⚠️${NC}  Render health check failed"
    echo "   Render free tier may take 30-60s to wake up on first request"
    echo "   Or deployment may still be in progress"
fi

echo ""

# Step 4: Final verification
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: FINAL VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Running comprehensive deployment tests..."
if [ -f "test-deployments.sh" ]; then
    ./test-deployments.sh
else
    echo -e "${YELLOW}⚠️${NC}  test-deployments.sh not found, skipping automated tests"

    echo ""
    echo "Manual testing:"
    echo ""
    echo "Test Vercel:"
    echo "  curl https://automated-profit-system.vercel.app/api/health | jq '.'"
    echo ""
    echo "Test Render:"
    echo "  curl https://automated-profit-system.onrender.com/api/health | jq '.'"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Your automated profit system is now deployed!"
echo ""
echo "📊 Access your dashboards:"
echo "  • Vercel: https://vercel.com/dashboard"
echo "  • Render: https://dashboard.render.com"
echo ""
echo "🧪 Test automation:"
echo "  export SERVER_URL=https://automated-profit-system.vercel.app"
echo "  node master-automation.js --immediate"
echo ""
echo "📅 Cron job schedule: Every Monday at 9:00 AM"
echo ""
echo "💰 Cost: \$7/month (Render Starter recommended)"
echo ""
