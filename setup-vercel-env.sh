#!/bin/bash

# ============================================
# VERCEL ENVIRONMENT VARIABLES SETUP
# Automatically adds all required env vars
# ============================================

set -e

echo "═══════════════════════════════════════════════════════════"
echo "   ⚙️  VERCEL ENVIRONMENT VARIABLES SETUP"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found: $(vercel --version | head -n 1)${NC}"
echo ""

# Check if user is logged in
echo -e "${BLUE}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Running: vercel login"
    vercel login
fi

VERCEL_USER=$(vercel whoami 2>&1 | tail -n 1)
echo -e "${GREEN}✅ Logged in as: $VERCEL_USER${NC}"
echo ""

# Load environment variables from .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

echo -e "${BLUE}⚙️  Adding environment variables to Vercel...${NC}"
echo "-----------------------------------------------------------"

# Array of environment variables to set
declare -a ENV_VARS=(
    "JWT_SECRET"
    "CRON_SECRET"
    "PRINTFUL_API_KEY"
    "AUTOMATION_SCHEDULE"
    "MAX_PRODUCTS"
    "GENERATE_DESIGNS"
    "CREATE_LISTINGS"
    "GENERATE_MARKETING"
    "GLOBAL_TRENDING"
    "TRENDING_REGIONS"
)

# Add each variable to Vercel
COUNT=0
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${YELLOW}Setting: $var${NC}"
        echo "${!var}" | vercel env add "$var" production --force 2>&1 | grep -v "Overwrite" || true
        COUNT=$((COUNT + 1))
        echo -e "${GREEN}✅ Added: $var${NC}"
    else
        echo -e "${RED}⚠️  Skipped (empty): $var${NC}"
    fi
done

echo ""
echo "-----------------------------------------------------------"
echo -e "${GREEN}✅ Added $COUNT environment variables to Vercel!${NC}"
echo ""

echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Deploy to production: ./deploy-to-vercel.sh"
echo "2. Or run: vercel --prod --yes"
echo ""
echo -e "${GREEN}Environment variables are ready! 🎉${NC}"
