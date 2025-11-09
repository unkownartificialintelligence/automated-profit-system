#!/bin/bash

# AUTOMATED SETUP SCRIPT FOR ALL USER TYPES
# Handles Owner, Client, and Team Member deployments automatically

echo "🚀 Automated Profit System - Universal Setup"
echo "=============================================="
echo ""

# Detect user type
echo "Select your user type:"
echo "1) Owner (You - 100% profit retention)"
echo "2) Client (Deploy for a client - their own store)"
echo "3) Team Member (Profit sharing enabled)"
echo ""
read -p "Enter choice (1/2/3): " USER_TYPE

case $USER_TYPE in
  1)
    echo "📦 Setting up OWNER account..."
    USER_MODE="owner"
    PROFIT_SHARE=0
    ACCOUNT_TYPE="personal"
    ;;
  2)
    echo "👥 Setting up CLIENT account..."
    USER_MODE="client"
    PROFIT_SHARE=0
    ACCOUNT_TYPE="client"
    read -p "Enter client name: " CLIENT_NAME
    ;;
  3)
    echo "🤝 Setting up TEAM MEMBER account..."
    USER_MODE="team"
    PROFIT_SHARE=25
    ACCOUNT_TYPE="team"
    read -p "Enter team member name: " TEAM_NAME
    read -p "Enter tier (bronze/silver/gold/platinum): " TIER
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🔧 Configuring environment..."

# Create .env file
cat > .env <<EOF
# User Configuration
USER_MODE=${USER_MODE}
ACCOUNT_TYPE=${ACCOUNT_TYPE}
PROFIT_SHARE_PERCENTAGE=${PROFIT_SHARE}

# Server Configuration
NODE_ENV=production
PORT=3000

# Printful API (Get from: https://www.printful.com/dashboard/store → Settings → API)
PRINTFUL_API_KEY=${PRINTFUL_API_KEY:-your_printful_api_key_here}

# Canva API (Optional - for automated design)
CANVA_API_KEY=${CANVA_API_KEY:-}

# Client/Team Specific
$([ "$USER_MODE" = "client" ] && echo "CLIENT_NAME=${CLIENT_NAME}")
$([ "$USER_MODE" = "team" ] && echo "TEAM_MEMBER=${TEAM_NAME}")
$([ "$USER_MODE" = "team" ] && echo "TEAM_TIER=${TIER}")
EOF

echo "✅ Environment configured"

# Create user-specific data directory
mkdir -p data/${ACCOUNT_TYPE}

# Initialize database based on user type
if [ "$USER_MODE" = "team" ]; then
  echo "🗄️ Initializing team database..."
  node src/database/init-team-profits.js
else
  echo "🗄️ Initializing personal database..."
  touch data/${ACCOUNT_TYPE}/sales.json
  echo '{"sales":[],"total_profit":0}' > data/${ACCOUNT_TYPE}/sales.json
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend if exists
if [ -d "frontend" ]; then
  echo "🎨 Building frontend..."
  cd frontend && npm install && npm run build && cd ..
fi

# Start server
echo ""
echo "✅ Setup complete!"
echo ""
echo "================================================"
if [ "$USER_MODE" = "owner" ]; then
  echo "👑 OWNER ACCOUNT ACTIVE"
  echo "   - 100% profit retention"
  echo "   - Full system access"
  echo "   - Personal sales tracking"
elif [ "$USER_MODE" = "client" ]; then
  echo "👥 CLIENT ACCOUNT: ${CLIENT_NAME}"
  echo "   - Dedicated store"
  echo "   - 100% profit (no sharing)"
  echo "   - Isolated data"
elif [ "$USER_MODE" = "team" ]; then
  echo "🤝 TEAM MEMBER: ${TEAM_NAME}"
  echo "   - Tier: ${TIER}"
  echo "   - Profit share: ${PROFIT_SHARE}% auto-deducted"
  echo "   - Team dashboard access"
fi
echo "================================================"
echo ""
echo "🚀 Starting server..."
npm start
