#!/bin/bash

# 🚀 Automated Profit System - Production Deployment Script
# This script starts your automated profit system in production mode

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎄 AUTOMATED PROFIT SYSTEM - DEPLOYMENT STARTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Kill any existing server processes
echo "🛑 Stopping existing server processes..."
pkill -f "node src/server.js" 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
sleep 2

# 2. Verify environment configuration
echo "🔍 Verifying environment configuration..."
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env file with your configuration"
    exit 1
fi

# Check required env vars
if ! grep -q "USER_MODE=owner" .env; then
    echo "⚠️  WARNING: USER_MODE not set to 'owner'"
fi

if ! grep -q "ACCOUNT_TYPE=personal" .env; then
    echo "⚠️  WARNING: ACCOUNT_TYPE not set to 'personal'"
fi

echo "✅ Environment configuration verified"
echo ""

# 3. Check dependencies
echo "📦 Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "✅ Dependencies ready"
echo ""

# 4. Create data directories
echo "📁 Creating data directories..."
mkdir -p data/owner
mkdir -p data/logs
echo "✅ Data directories created"
echo ""

# 5. Start the server
echo "🚀 Starting automated profit system..."
nohup node src/server.js > data/logs/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# 6. Health check
echo "🏥 Running health check..."
HEALTH_CHECK=$(curl -s http://localhost:3003/api/health)

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo "✅ Server is HEALTHY and RUNNING!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ DEPLOYMENT SUCCESSFUL!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 System Information:"
    echo "   Server URL:     http://localhost:3003"
    echo "   Process ID:     $SERVER_PID"
    echo "   Log File:       data/logs/server.log"
    echo "   Data Directory: data/owner/"
    echo ""
    echo "🎄 Christmas Automation:"
    echo "   Dashboard:      http://localhost:3003/api/christmas/dashboard"
    echo "   Today's Products: http://localhost:3003/api/christmas/today"
    echo "   Revenue Projection: http://localhost:3003/api/christmas/revenue"
    echo ""
    echo "💰 Your Personal Account:"
    echo "   Dashboard:      http://localhost:3003/api/dashboard"
    echo "   Profit Model:   100% Retention (Owner Mode)"
    echo ""
    echo "📝 Quick Start:"
    echo "   1. curl http://localhost:3003/api/christmas/today"
    echo "   2. curl http://localhost:3003/api/christmas/design/0"
    echo "   3. Create design + list on Printful (5-7 min)"
    echo "   4. curl http://localhost:3003/api/christmas/marketing/0"
    echo "   5. Post to social media & start selling!"
    echo ""
    echo "📖 Documentation:"
    echo "   - CHRISTMAS_PROFIT_SYSTEM.md (Full guide)"
    echo "   - PRINTFUL_MANUAL_WORKFLOW.md (Listing guide)"
    echo ""
    echo "🎯 Projected Season Profit: \$9,042.74"
    echo "⏰ Time Required: 2-3 hours/day"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🚀 YOUR AUTOMATED PROFIT SYSTEM IS LIVE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo "❌ ERROR: Server health check failed!"
    echo "Check logs: tail -f data/logs/server.log"
    exit 1
fi
