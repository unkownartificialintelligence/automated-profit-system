#!/bin/bash

# ============================================
# 🚀 UNIFIED DEPLOYMENT SCRIPT
# ============================================
# Deploy to BOTH Vercel AND Render with ONE command
#
# Usage:
#   ./deploy-unified.sh              # Deploy to both platforms
#   ./deploy-unified.sh vercel       # Deploy to Vercel only
#   ./deploy-unified.sh render       # Deploy to Render only
#   ./deploy-unified.sh --help       # Show help
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}║     🚀  UNIFIED DEPLOYMENT SYSTEM  🚀                      ║${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}║     Deploy to Vercel & Render with ONE command            ║${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_requirements() {
    print_info "Checking requirements..."

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install it first."
        exit 1
    fi

    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first."
        exit 1
    fi

    print_success "All requirements met"
}

setup_environment() {
    print_info "Setting up environment..."

    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found, creating from example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created from template"
            print_warning "⚠️  Please edit .env with your actual API keys before deploying!"
        else
            print_error ".env.example not found"
        fi
    else
        print_success ".env file exists"
    fi

    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

deploy_to_vercel() {
    print_info "Deploying to Vercel..."

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found, installing..."
        npm install -g vercel
    fi

    # Deploy to Vercel
    print_info "Running Vercel deployment..."
    vercel --prod

    print_success "Deployed to Vercel successfully!"

    # Get Vercel URL
    VERCEL_URL=$(vercel inspect --prod | grep "url:" | awk '{print $2}' || echo "Check Vercel dashboard")
    print_info "Vercel URL: ${VERCEL_URL}"
}

deploy_to_render() {
    print_info "Deploying to Render..."

    # Push to main branch (Render auto-deploys from git)
    print_info "Pushing to GitHub (Render will auto-deploy)..."

    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)

    # Commit any changes
    if [ -n "$(git status --porcelain)" ]; then
        print_info "Committing changes..."
        git add .
        git commit -m "Deploy: Unified deployment $(date +'%Y-%m-%d %H:%M:%S')" || true
    fi

    # Push to GitHub
    git push origin ${CURRENT_BRANCH}

    print_success "Pushed to GitHub - Render will auto-deploy"
    print_info "Check your Render dashboard: https://dashboard.render.com"
}

configure_automation() {
    print_info "Configuring automation..."

    # Make master-automation.js executable
    chmod +x master-automation.js

    print_success "Automation configured"
    print_info "Automation will run automatically on both platforms:"
    print_info "  - Vercel: Using cron jobs (see vercel.json)"
    print_info "  - Render: Using worker process (see render.yaml)"
}

show_help() {
    cat << EOF

🚀 UNIFIED DEPLOYMENT SCRIPT

USAGE:
    ./deploy-unified.sh [PLATFORM]

PLATFORMS:
    (none)      Deploy to both Vercel and Render
    vercel      Deploy to Vercel only
    render      Deploy to Render only
    --help      Show this help message

ENVIRONMENT VARIABLES (set in .env or platform dashboard):
    Required:
    - JWT_SECRET              Secure random string (32+ chars)
    - NODE_ENV                production

    Optional:
    - PRINTFUL_API_KEY        Printful integration
    - CANVA_API_KEY           Canva automation
    - STRIPE_API_KEY          Payment processing
    - OPENAI_API_KEY          AI features
    - SENTRY_DSN              Error monitoring

    Automation Settings:
    - MAX_PRODUCTS            Max products per run (default: 5)
    - GENERATE_DESIGNS        Enable design generation (default: true)
    - CREATE_LISTINGS         Enable listings (default: true)
    - GENERATE_MARKETING      Enable marketing (default: true)
    - GLOBAL_TRENDING         Enable trending discovery (default: true)
    - TRENDING_REGIONS        Regions to check (default: US,GB,CA,AU,DE,FR,JP,BR,IN,MX)

EXAMPLES:
    # Deploy to both platforms
    ./deploy-unified.sh

    # Deploy to Vercel only
    ./deploy-unified.sh vercel

    # Deploy to Render only
    ./deploy-unified.sh render

AUTOMATION:
    The system includes automated workflows that run on schedule:

    Vercel:
    - Cron jobs defined in vercel.json
    - Runs master-automation.js via API endpoint

    Render:
    - Worker process defined in render.yaml
    - Runs master-automation.js as background service

    Manual trigger:
    - node master-automation.js --immediate

MORE INFO:
    - Vercel docs: https://vercel.com/docs
    - Render docs: https://render.com/docs
    - GitHub repo: https://github.com/unkownartificialintelligence/automated-profit-system

EOF
}

deploy_both() {
    print_header
    check_requirements
    setup_environment
    configure_automation

    echo ""
    print_info "Starting deployment to both platforms..."
    echo ""

    # Deploy to Vercel
    deploy_to_vercel
    echo ""

    # Deploy to Render
    deploy_to_render
    echo ""

    print_success "🎉 DEPLOYMENT COMPLETE!"
    echo ""
    print_info "Next steps:"
    print_info "1. Check Vercel dashboard: https://vercel.com/dashboard"
    print_info "2. Check Render dashboard: https://dashboard.render.com"
    print_info "3. Verify automation is running on both platforms"
    print_info "4. Monitor logs for any issues"
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================

case "$1" in
    vercel)
        print_header
        check_requirements
        setup_environment
        configure_automation
        deploy_to_vercel
        ;;
    render)
        print_header
        check_requirements
        setup_environment
        configure_automation
        deploy_to_render
        ;;
    --help)
        show_help
        ;;
    *)
        deploy_both
        ;;
esac
