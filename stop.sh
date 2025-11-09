#!/bin/bash

# 🛑 Automated Profit System - Stop Script

echo "🛑 Stopping Automated Profit System..."

# Kill all node server processes
pkill -f "node src/server.js"
lsof -ti:3003 | xargs kill -9 2>/dev/null

sleep 2

# Check if stopped
if lsof -ti:3003 > /dev/null 2>&1; then
    echo "❌ ERROR: Server is still running on port 3003"
    exit 1
else
    echo "✅ Server stopped successfully"
    echo ""
    echo "To restart, run: ./deploy.sh"
fi
