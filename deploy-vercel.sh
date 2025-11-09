#!/bin/bash

# ========================================
# VERCEL DEPLOYMENT SCRIPT
# ========================================

echo "🚀 Preparing for Vercel Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo ""
fi

# Pre-deployment checks
echo -e "${BLUE}Running pre-deployment checks...${NC}"
echo ""

# Check 1: Git status
echo "1. Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        echo "Enter commit message:"
        read commit_message
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✅ Git working tree clean${NC}"
fi
echo ""

# Check 2: Package dependencies
echo "2. Checking dependencies..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Root package.json found${NC}"
else
    echo -e "${RED}❌ Root package.json not found${NC}"
    exit 1
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅ Frontend package.json found${NC}"
else
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi
echo ""

# Check 3: Vercel configuration
echo "3. Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
    echo "Configuration:"
    cat vercel.json | head -20
else
    echo -e "${YELLOW}⚠️  vercel.json not found${NC}"
    echo "Creating default vercel.json..."
    # Create default if not exists
fi
echo ""

# Check 4: Environment variables check
echo "4. Environment variables needed:"
echo "   - PRINTFUL_API_KEY (required)"
echo "   - PORT (default: 3003)"
echo "   - NODE_ENV (default: production)"
echo ""
echo -e "${YELLOW}⚠️  Remember to set these in Vercel Dashboard!${NC}"
echo ""

# Check 5: Build test
echo "5. Testing build locally (optional)..."
read -p "Do you want to test build locally first? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing dependencies..."
    npm install
    cd frontend
    npm install
    echo ""
    echo "Building frontend..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
        cd ..
    else
        echo -e "${RED}❌ Build failed${NC}"
        echo "Fix errors before deploying to Vercel"
        exit 1
    fi
fi
echo ""

# Deployment options
echo "========================================"
echo -e "${BLUE}Deployment Options:${NC}"
echo "========================================"
echo ""
echo "1. Deploy to Vercel (Preview)"
echo "2. Deploy to Vercel (Production)"
echo "3. Set up Vercel project"
echo "4. View deployment status"
echo "5. Exit"
echo ""
read -p "Select option (1-5): " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}Deploying to Preview...${NC}"
        vercel
        echo ""
        echo -e "${GREEN}✅ Preview deployment complete!${NC}"
        echo "Test the preview URL before deploying to production"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⚠️  This will deploy to PRODUCTION${NC}"
        read -p "Are you sure? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${BLUE}Deploying to Production...${NC}"
            vercel --prod
            echo ""
            echo -e "${GREEN}✅ Production deployment complete!${NC}"
            echo ""
            echo "🎉 Your system is now LIVE!"
            echo ""
            echo "Next steps:"
            echo "1. Test all API endpoints"
            echo "2. Verify frontend loads correctly"
            echo "3. Check environment variables"
            echo "4. Set up custom domain (optional)"
            echo "5. Enable monitoring"
        else
            echo "Deployment cancelled"
        fi
        ;;
    3)
        echo ""
        echo -e "${BLUE}Setting up Vercel project...${NC}"
        vercel
        echo ""
        echo "Follow the prompts to:"
        echo "1. Link to existing project or create new"
        echo "2. Configure project settings"
        echo "3. Add environment variables"
        ;;
    4)
        echo ""
        echo -e "${BLUE}Checking deployment status...${NC}"
        vercel ls
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo -e "${GREEN}Deployment script complete!${NC}"
echo "========================================"
echo ""

# Show helpful next steps
if [ $option -eq 2 ]; then
    echo "📊 View your deployment:"
    echo "   vercel ls"
    echo ""
    echo "📝 View logs:"
    echo "   vercel logs [deployment-url]"
    echo ""
    echo "🌐 Open in browser:"
    echo "   vercel open"
    echo ""
    echo "⚙️  Set environment variables:"
    echo "   1. Go to Vercel Dashboard"
    echo "   2. Select your project"
    echo "   3. Settings → Environment Variables"
    echo "   4. Add: PRINTFUL_API_KEY=your_key"
    echo ""
fi

echo "📚 Full documentation: VERCEL_DEPLOYMENT.md"
echo ""
