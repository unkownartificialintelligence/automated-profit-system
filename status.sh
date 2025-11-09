#!/bin/bash

# 📊 Automated Profit System - Status Check

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 AUTOMATED PROFIT SYSTEM - STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if server is running
if lsof -ti:3003 > /dev/null 2>&1; then
    echo "✅ Server Status: RUNNING"
    PID=$(lsof -ti:3003)
    echo "   Process ID: $PID"
    echo ""

    # Get health check
    echo "🏥 Health Check:"
    curl -s http://localhost:3003/api/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('   Server:', data['checks']['server']['status'])
    print('   Database:', data['checks']['database']['status'])
    print('   Uptime:', data['uptime'], 'seconds')
    print('')
except:
    print('   ❌ Unable to connect to server')
    print('')
"

    # Get dashboard stats
    echo "💰 Your Personal Account:"
    curl -s http://localhost:3003/api/dashboard | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('   Account Type:', data['user_type'].upper())
    print('   Profit Model:', str(data['profit_share']) + '% share (100% retention)')
    print('   Total Sales:', data['summary']['total_sales'])
    print('   Total Profit: $' + str(data['summary']['total_profit']))
    print('')
except:
    print('   ❌ Unable to fetch dashboard data')
    print('')
"

    # Get Christmas automation stats
    echo "🎄 Christmas Automation:"
    curl -s http://localhost:3003/api/christmas/revenue | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    proj = data['projection']
    print('   Products Available:', proj['total_products'])
    print('   Season Projection:', proj['total_profit'])
    print('   Daily Average:', proj['daily_average_profit'])
    print('   Season Duration:', proj['season_duration'])
    print('')
except:
    print('   ❌ Unable to fetch Christmas data')
    print('')
"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ SYSTEM OPERATIONAL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Quick Commands:"
    echo "  View logs:        tail -f data/logs/server.log"
    echo "  Stop server:      ./stop.sh"
    echo "  Restart server:   ./deploy.sh"
    echo "  Today's products: curl http://localhost:3003/api/christmas/today"
    echo ""

else
    echo "❌ Server Status: NOT RUNNING"
    echo ""
    echo "To start the server, run: ./deploy.sh"
    echo ""
fi
