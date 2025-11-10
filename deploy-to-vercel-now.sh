#!/bin/bash

# ========================================
# AUTOMATED VERCEL DEPLOYMENT - ONE COMMAND
# ========================================

set -e

echo "🚀 AUTOMATED VERCEL DEPLOYMENT"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
echo ""

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git installed${NC}"

# Check Node/NPM
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ NPM installed${NC}"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi

echo ""
echo "========================================"
echo -e "${BLUE}DEPLOYMENT INSTRUCTIONS${NC}"
echo "========================================"
echo ""

echo "To complete deployment, you need to:"
echo ""
echo "1. Login to Vercel:"
echo "   ${YELLOW}vercel login${NC}"
echo ""
echo "2. Deploy to preview (test first):"
echo "   ${YELLOW}vercel${NC}"
echo ""
echo "3. After testing preview, deploy to production:"
echo "   ${YELLOW}vercel --prod${NC}"
echo ""
echo "4. Set environment variables in Vercel Dashboard:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Settings → Environment Variables"
echo "   - Add: PRINTFUL_API_KEY=your_key_here"
echo ""
echo "========================================"
echo ""

# Interactive deployment
echo -e "${YELLOW}Would you like to start deployment now?${NC}"
echo ""
echo "This will:"
echo "  1. Login to Vercel (opens browser)"
echo "  2. Create/link project"
echo "  3. Deploy to preview"
echo ""
read -p "Start deployment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting Vercel login...${NC}"
    echo ""

    # Login to Vercel
    vercel login

    echo ""
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    echo ""
    echo "Follow the prompts:"
    echo "  - Set up and deploy? Yes"
    echo "  - Which scope? Select your account"
    echo "  - Link to existing project? No (first time) / Yes (if exists)"
    echo "  - Project name? automated-profit-system (or custom)"
    echo "  - Directory? ./ (root)"
    echo ""

    # Deploy
    vercel

    echo ""
    echo "========================================"
    echo -e "${GREEN}🎉 PREVIEW DEPLOYMENT COMPLETE!${NC}"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Test your preview URL"
    echo "2. Add environment variables:"
    echo "   - PRINTFUL_API_KEY in Vercel Dashboard"
    echo "3. Deploy to production:"
    echo "   ${YELLOW}vercel --prod${NC}"
    echo ""
    echo "View your project:"
    echo "   ${YELLOW}vercel ls${NC}"
    echo ""
    echo "Open in browser:"
    echo "   ${YELLOW}vercel open${NC}"
    echo ""
else
    echo ""
    echo "Deployment cancelled."
    echo ""
    echo "To deploy manually later, run:"
    echo "  ${YELLOW}vercel login${NC}"
    echo "  ${YELLOW}vercel${NC}"
    echo ""
fi

echo "========================================"
echo "Documentation: VERCEL_DEPLOYMENT.md"
echo "Quick Start: VERCEL_QUICK_START.txt"
echo "========================================"
